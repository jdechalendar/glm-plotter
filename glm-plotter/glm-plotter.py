"""
JAC - jdechalendar@stanford.edu
"""
from flask import Flask, render_template, request, session
import os
import json
import GLMparser

app = Flask(__name__)


@app.route("/", methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        if (('fixedNodes' in request.files) and request.files['fixedNodes']
            and (request.files['fixedNodes'].filename
                 .rsplit('.', 1)[1] == 'csv')):
            print('Reading the csv file')
            session['csv'] = 1
            fullfilename = os.path.join(
                app.config['UPLOAD_FOLDER'], "curr.csv")
            request.files['fixedNodes'].save(fullfilename)

        if (('glm_file' in request.files) and request.files['glm_file']
            and (request.files['glm_file'].filename
                 .rsplit('.', 1)[1] == 'glm')):
            print('Reading the glm file')
            session.clear()
            session['glm_name'] = request.files['glm_file'].filename
            fullfilename = os.path.join(
                app.config['UPLOAD_FOLDER'], "curr.glm")
            request.files['glm_file'].save(fullfilename)

    return render_template("index.html")


@app.route("/data")
def data():
    glmFile = os.path.join(app.config['UPLOAD_FOLDER'], "curr.glm")
    csvFile = os.path.join(app.config['UPLOAD_FOLDER'], "curr.csv")
    if 'csv' in session and session['csv'] and os.path.isfile(csvFile):
        fixedNodesJSON = parseFixedNodes(csvFile)
    else:
        fixedNodesJSON = '{"names":[], "x":[], "y":[]}'
    if os.path.isfile(glmFile):
        objs, modules, commands = GLMparser.readGLM(glmFile)
        graphJSON = GLMparser.createD3JSON(objs)
    else:
        graphJSON = '{"nodes":[],"links":[]}'
    if 'glm_name' in session:
        glm_name = session['glm_name']
    else:
        glm_name = ''
    JSONstr = '{"file":"' + glm_name + '","graph":' + \
        graphJSON + ',"fixedNodes":' + fixedNodesJSON + '}'

    return JSONstr


app.config['UPLOAD_FOLDER'] = 'uploads'


def parseFixedNodes(nodesFile):
    with open(nodesFile) as fr:
        lines = fr.readlines()
    names = []
    x = []
    y = []
    for line in lines:
        bla = line.split(',')
        if len(bla) == 3:
            names.append(bla[0])
            x.append(float(bla[1]))
            y.append(float(bla[2]))

    return json.dumps({'names': names, 'x': x, 'y': y})


if __name__ == "__main__":
    app.secret_key = 'B0er23j/4yX R~XHH!jmN]LWX/,?Rh'
    app.run()
