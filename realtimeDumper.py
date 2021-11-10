import os
import git
from git import Repo
import sys
import shutil
import subprocess

# args mean commandline arguments
# args[1]:studentNumber
# args[2]~:commit hash
args = sys.argv

print("sdfjladksjflasdjfas;dlfkjasdfas")
print(args)

# git clone from gitbucket
# repoUrl = "https://loki.ics.es.osaka-u.ac.jp/gitbucket/git/" + \
#     args[1] + "/enshud.git"
repoUrl = "http://172.16.1.10:8080/git/root/" + args[1] + ".git"
workspacePath = './workspaces/'+args[1]

if os.path.exists(workspacePath):
    shutil.rmtree(workspacePath)

git.Repo.clone_from(
    repoUrl,
    workspacePath)


# back to hash
repo = Repo(workspacePath)
repo.git.reset('--hard', args[2])


# write log
logPath = "./logs/" + args[1]
if not os.path.exists(logPath):
    os.makedirs(logPath)
filename = logPath+"/" + args[1] + "_" + str(len(os.listdir(logPath))
                                             ).zfill(3) + "_" + str(args[2])[0:4] + ".log"
with open(filename, "w") as f:
    os.chdir(workspacePath)
    subprocess.call(
        ['git', 'show', '--date=format:"%Y-%m-%d %H:%M:%S"'], stdout=f)
    subprocess.call(['./gradlew', 'test', '-i'], stdout=f)

# TODO
# add install GitPython to readme
