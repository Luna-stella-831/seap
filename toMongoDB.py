import os
import subprocess as sp


def upload():
    ls_file_name = os.listdir("./jsons")

    for name in ls_file_name:

        sp.call(['mongoimport', '--db', 'seapdb', '--collection',
                'commits', '--type', 'json', '--file', "./jsons/"+name])
