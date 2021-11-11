import realtimeParser
import toMongoDB
import os
import git
from git import *
import shutil
import subprocess
from sys import stdin

# args mean commandline arguments
# args[0]:studentNumber
# args[1]~:commit hash
arg = stdin.readline()
args = arg.split(",")

# git clone from gitbucket
# repoUrl = "https://loki.ics.es.osaka-u.ac.jp/gitbucket/git/" + \
#     args[0] + "/enshud.git"
repoUrl = "http://172.16.1.10:8080/git/root/" + args[0] + ".git"
workspacePath = './workspaces/'+args[0]

if os.path.exists(workspacePath):
    shutil.rmtree(workspacePath)

git.Repo.clone_from(
    repoUrl,
    workspacePath)


# back to hash
repo = Repo(workspacePath)
os.chdir(workspacePath)

for hash in args[1:]:
    repo.git.reset('--hard', hash.replace("\n", ""))

    # write log
    logPath = "../../logs/" + args[0]
    if not os.path.exists(logPath):
        os.makedirs(logPath)
    filename = logPath+"/" + args[0] + "_" + str(len(os.listdir(logPath))
                                                 ).zfill(3) + "_" + str(hash)[0:4] + ".log"
    with open(filename, "w") as f:
        subprocess.call(
            ['git', 'show', '--date=format:"%Y-%m-%d %H:%M:%S"'], stdout=f)
        subprocess.call(['./gradlew', 'test', '-i'], stdout=f)

os.chdir("../..")
realtimeParser.parse()
toMongoDB.upload()
