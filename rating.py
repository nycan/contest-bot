# Code from https://github.com/DMOJ/online-judge/blob/master/judge/ratings.py
from bisect import bisect
from math import pi, sqrt, tanh
from operator import attrgetter, itemgetter

BETA2 = 328.33 ** 2
RATING_INIT = 1200      # Newcomer's rating when applying the rating floor/ceiling
MEAN_INIT = 1500.
VAR_INIT = 350**2 * (BETA2 / 212**2)
SD_INIT = sqrt(VAR_INIT)
VALID_RANGE = MEAN_INIT - 20 * SD_INIT, MEAN_INIT + 20 * SD_INIT
VAR_PER_CONTEST = 1219.047619 * (BETA2 / 212**2)
VAR_LIM = (sqrt(VAR_PER_CONTEST**2 + 4 * BETA2 * VAR_PER_CONTEST) - VAR_PER_CONTEST) / 2
SD_LIM = sqrt(VAR_LIM)
TANH_C = sqrt(3) / pi

def tie_ranker(iterable, key=attrgetter('points')):
    rank = 0
    delta = 1
    last = None
    buf = []
    for item in iterable:
        new = key(item)
        if new != last:
            for _ in buf:
                yield rank + (delta - 1) / 2.0
            rank += delta
            delta = 0
            buf = []
        delta += 1
        buf.append(item)
        last = key(item)
    for _ in buf:
        yield rank + (delta - 1) / 2.0

def eval_tanhs(tanh_terms, x):
    return sum((wt / sd) * tanh((x - mu) / (2 * sd)) for mu, sd, wt in tanh_terms)

def solve(tanh_terms, y_tg, lin_factor=0, bounds=VALID_RANGE):
    L, R = bounds
    Ly, Ry = None, None
    while R - L > 2:
        x = (L + R) / 2
        y = lin_factor * x + eval_tanhs(tanh_terms, x)
        if y > y_tg:
            R, Ry = x, y
        elif y < y_tg:
            L, Ly = x, y
        else:
            return x
    # Use linear interpolation to be slightly more accurate.
    if Ly is None:
        Ly = lin_factor * L + eval_tanhs(tanh_terms, L)
    if y_tg <= Ly:
        return L
    if Ry is None:
        Ry = lin_factor * R + eval_tanhs(tanh_terms, R)
    if y_tg >= Ry:
        return R
    ratio = (y_tg - Ly) / (Ry - Ly)
    return L * (1 - ratio) + R * ratio

def get_var(times_ranked, cache=[VAR_INIT]):
    while times_ranked >= len(cache):
        next_var = 1. / (1. / (cache[-1] + VAR_PER_CONTEST) + 1. / BETA2)
        cache.append(next_var)
    return cache[times_ranked]

def recalculate_ratings(ranking, old_mean, times_ranked, historical_p):
    n = len(ranking)
    new_p = [0.] * n
    new_mean = [0.] * n

    # Note: pre-multiply delta by TANH_C to improve efficiency.
    delta = [TANH_C * sqrt(get_var(t) + VAR_PER_CONTEST + BETA2) for t in times_ranked]
    p_tanh_terms = [(m, d, 1) for m, d in zip(old_mean, delta)]

    # Calculate performance at index i.
    def solve_idx(i, bounds=VALID_RANGE):
        r = ranking[i]
        y_tg = 0
        for d, s in zip(delta, ranking):
            if s > r:       # s loses to r
                y_tg += 1. / d
            elif s < r:     # s beats r
                y_tg -= 1. / d
            # Otherwise, this is a tie that counts as half a win, as per Elo-MMR.
        new_p[i] = solve(p_tanh_terms, y_tg, bounds=bounds)

    # Fill all indices between i and j, inclusive. Use the fact that new_p is non-increasing.
    def divconq(i, j):
        if j - i > 1:
            k = (i + j) // 2
            solve_idx(k, bounds=(new_p[j], new_p[i]))
            divconq(i, k)
            divconq(k, j)

    if n < 2:
        new_p = list(old_mean)
        new_mean = list(old_mean)
    else:
        # Calculate performance.
        solve_idx(0)
        solve_idx(n - 1)
        divconq(0, n - 1)

        # Calculate mean.
        for i, r in enumerate(ranking):
            tanh_terms = []
            w_prev = 1.
            w_sum = 0.
            for j, h in enumerate([new_p[i]] + historical_p[i]):
                gamma2 = (VAR_PER_CONTEST if j > 0 else 0)
                h_var = get_var(times_ranked[i] + 1 - j)
                k = h_var / (h_var + gamma2)
                w = w_prev * k**2
                # Future optimization: If j is around 20, then w < 1e-3 and it is possible to break early.
                tanh_terms.append((h, sqrt(BETA2) * TANH_C, w))
                w_prev = w
                w_sum += w / BETA2
            w0 = 1. / get_var(times_ranked[i] + 1) - w_sum
            p0 = eval_tanhs(tanh_terms[1:], old_mean[i]) / w0 + old_mean[i]
            new_mean[i] = solve(tanh_terms, w0 * p0, lin_factor=w0)

    # Display a slightly lower rating to incentivize participation.
    # As times_ranked increases, new_rating converges to new_mean.
    new_rating = [max(1, round(m - (sqrt(get_var(t + 1)) - SD_LIM))) for m, t in zip(new_mean, times_ranked)]

    return new_rating, new_mean, new_p

# </code from DMOJ>

def rate_contest(contestCode):
    from pymongo import MongoClient
    from dotenv import load_dotenv
    from os import getenv

    load_dotenv()

    client = MongoClient(getenv("MONGO_CONNECTION_STRING"))
    db = client["contetst-bot"]
    