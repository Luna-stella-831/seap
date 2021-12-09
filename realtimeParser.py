import os
import json
import sys


def getValue(key, items):
    values = [x['status']
              for x in items if 'name' in x and 'status' in x and x['name'] == key]
    return values[0] if values else None


def makeStatus(dict, dictName, status, names):
    start = 0
    dict["name"] = dictName
    for name in names:
        if dictName not in name:
            start = start + 1
        else:
            break
    dictName = "enshud." + dictName
    dict["status"] = status[start:start +
                            sum(s.startswith(dictName) for s in names)]
    return dict


def parse(studentNum):
    with open("testCases.txt", "r", errors='ignore') as tests:
        testCases = tests.read().splitlines()

    year = "2021"
    #outDelectName = "./jsons"
    outDelectName = "./debug_json"
    # studentNums = [f for f in os.listdir(
    #     "./workspaces") if not f.startswith(".")]

    # for studentNum in studentNums:
    fileNames = os.listdir("./logs/"+studentNum)
    student = {}
    commits = []
    student["author"] = studentNum
    student["graduate_at"] = year

    fileNames.sort()

    for fileName in fileNames:

        with open("./logs/" + studentNum + "/" + fileName, "r", errors='ignore') as log:
            Lines = log.read().splitlines()

        test_info = []
        test_summary = []
        status = ""
        commit = {}
        date = Lines[2].split()[1] + " " + Lines[2].split()[2]
        commit["date"] = date.replace('"', '')
        commit["commit_message"] = Lines[4].replace('    ', '')

        for case in testCases:
            test = {}
            c = case.split()
            test["name"] = c[0] + "#" + c[2]
            test["status"] = "pass"
            test_info.append(test)

        for line in Lines:
            if line.startswith("> Task") and line.endswith("FAILED"):
                for d in test_info:
                    d["status"] = "fail"
            if any(line.startswith(case) for case in testCases):
                infos = line.split()
                for d in test_info:
                    if infos[0] + '#' + infos[2] == d.get('name'):
                        if infos[3] == "FAILED":
                            d["status"] = "fail"
                        elif infos[0] + '#' + infos[2] == "enshud.s4.compiler.CompilerTest#testNormal20" and infos[3] == "STANDARD_ERROR":
                            d["status"] = "fail"
        commit["test_info"] = sorted(test_info, key=lambda x: x['name'])
        testNames = sorted([d.get('name') for d in test_info])
        for testName in testNames:
            if getValue(testName, test_info) == "pass":
                status = status + 'o'
            elif getValue(testName, test_info) == "fail":
                status = status + 'x'
        s0 = {}
        test_summary.append(makeStatus(s0, "s0", status, testNames))
        s1 = {}
        test_summary.append(makeStatus(s1, "s1", status, testNames))
        s2 = {}
        test_summary.append(makeStatus(s2, "s2", status, testNames))
        s3 = {}
        test_summary.append(makeStatus(s3, "s3", status, testNames))
        s4 = {}
        test_summary.append(makeStatus(s4, "s4", status, testNames))
        commit["test_summary"] = test_summary
        commits.append(commit)
        student["commits"] = commits
        if not os.path.exists(outDelectName):
            os.makedirs(outDelectName)
        jName = "./jsons/"+studentNum + ".json"
        with open(jName, "w") as jN:
            jN.write(json.dumps(student, indent=2))
