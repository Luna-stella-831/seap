import os
import git
from git import Repo
import shutil
import subprocess
from sys import stdin

# args mean commandline arguments
# args[0]:studentNumber
# args[1]~:commit hash
args = stdin.readlines()

print("sdfjladksjflasdjfas;dlfkjasdfas")
print(args)

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
repo.git.reset('--hard', args[1])


# write log
logPath = "./logs/" + args[0]
if not os.path.exists(logPath):
    os.makedirs(logPath)
filename = logPath+"/" + args[0] + "_" + str(len(os.listdir(logPath))
                                             ).zfill(3) + "_" + str(args[1])[0:4] + ".log"
with open(filename, "w") as f:
    os.chdir(workspacePath)
    subprocess.call(
        ['git', 'show', '--date=format:"%Y-%m-%d %H:%M:%S"'], stdout=f)
    subprocess.call(['./gradlew', 'test', '-i'], stdout=f)

# TODO
# add install GitPython to readme
