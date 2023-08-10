exports.Contest = class Contest{
    constructor(code, name, problems, rules,
        windowStart, windowEnd, duration,
        problemFiles, solutionFiles,
        whitelist, list){
        this.code = code;
        this.name = name;
        this.problems = problems;
        this.rules = rules; // disclaimer with rules, eligibility, etc.
        this.windowStart = windowStart;
        this.windowEnd = windowEnd;
        this.duration = duration; // in minutes
        this.problemFiles = problemFiles;
        this.solutionFiles = solutionFiles;
        this.whitelist = whitelist; // boolean. true if whitelist, false if blacklist
        this.list = list; // set of users
    }
}