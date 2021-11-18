import os
import subprocess as sp


def upload(studentNum):

    sp.call(['mongoimport', '--db', 'seapdb', '--collection',
            'commits', '--type', 'json', '--file', "./jsons/"+studentNum+".json"])
