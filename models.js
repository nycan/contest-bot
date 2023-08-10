exports.Contest = class Contest{
    constructor(code, name, problems, rules, windowStart, windowEnd, duration, problemFiles, solutionFiles){
        this.code = code;
        this.name = name;
        this.problems = problems;
        this.rules = rules; // disclaimer with rules, eligibility, etc.
        this.windowStart = windowStart;
        this.windowEnd = windowEnd;
        this.duration = duration; // in minutes
    }
}