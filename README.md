# glm-plotter

An example plot of the IEEE 123-node test feeder
![Alt text](etc/ieee123_example.png?raw=true "IEEE 123 node example")

# Usage
* Install python packages (see install.txt).
* Change directory to the directory glm-plotter in this repo.
* Run the glm-plotter.py file.
```
cd glm-plotter
python glm-plotter.py
```
* Open a browser and go to http://localhost:5000

# Description
This app parses a .glm (GridLab-D Model) file and displays the corresponding network. The visualization uses the D3 force layout algorithm by Mike Bostock.
Hovering over a node or link will display its class. The nodes can be dragged to locations. Once they have been dragged, they are fixed. They can be released again with a double-click.

**Options**
* Export the position of the nodes (in the html svg component) to a csv
* Export the position of the fixed nodes to a csv
* Remove a prefix in the names (in some glm files there will be a common predix that makes visualization cumbersome)
* Load a csv file (typically one you have exported as above) with positions for the nodes. Those nodes will now be fixed to the required positions.