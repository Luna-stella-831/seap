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
##print("realtimeDumper is started")
arg = stdin.readline()
args = arg.split(",")

# git clone from gitbucket
repoUrl = "https://loki.ics.es.osaka-u.ac.jp/gitbucket/git/" + \
    args[0] + "/enshud.git"
#repoUrl = "http://172.16.1.10:8080/git/root/" + args[0] + ".git"
workspacePath = './workspaces/'+args[0]

if os.path.exists(workspacePath):
    shutil.rmtree(workspacePath)

print(repoUrl)
git.Repo.clone_from(
    repoUrl,
    workspacePath)

hashes = []
# back to hash
repo = Repo(workspacePath)
os.chdir(workspacePath)

for item in repo.iter_commits('master'):
    ##print("%s %s %s " % (item.hexsha, item.author, dt))
    if str(item.author) == args[0]:
        hashes.append(item.hexsha)

hashes.reverse()

print(hashes)

for hash in hashes:
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
realtimeParser.parse(args[0])
toMongoDB.upload(args[0])
print(args[0]+" is uploaded on commits collections")
# print("finish")
