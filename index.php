<?php session_start(); ?>
<?php require_once("functions.php"); ?> 
<?php
    if(empty($_SESSION["username"])){
        if(empty($_GET["guest"])){
            header("location: login.php");
        }else{
            $username = getUsernameByInviteCode($_GET["guest"]);
            if(empty($username)){
                header("location: login.php");
            }else{
                $_SESSION["username"] = $username;
            }
        }
    } else {
        $username = $_SESSION["username"];
    }
    if ($_SERVER["REQUEST_METHOD"] == "POST"){
        $projectNameErr = "";
        $deleteProjectErr = "";
        $editProjectErr = "";
        switch($_POST['submit']) {
            case 'createProjectForm':
                if (empty($_POST["projectName"])) {
                    $projectNameErr = "name is required.";
                } else {
                    $projectName = $_POST["projectName"];
                    if (!preg_match("/^[a-zA-Z0-9_-]*$/", $projectName)) {
                        $projectNameErr = "Only letters and numbers allowed in project name";
                    } else {
                        $projectNameErr = createNewProject($projectName, $username);
                    }
                }
                break;
            case 'deleteProjct':
                if (empty($_POST["deleteProjectName"])) {
                    $deleteProjectErr = "No project selected";
                }else{
                    $projectName = $_POST["deleteProjectName"];
                    if (!preg_match("/^[a-zA-Z0-9_-]*$/", $projectName)) {
                        $deleteProjectErr = "Only letters and numbers allowed in project name";
                    } else {
                        deleteProject($projectName, $username);
                    }
                }
            case 'editProject':
                if (empty($_POST["projectPreviousName"]) || empty($_POST["projectNewName"])) {
                    $editProjectErr = "Please enter project name.";
                }else{
                    $projectNewName = $_POST["projectNewName"];
                    $projectPreviousName = $_POST["projectPreviousName"];
                    if (!preg_match("/^[a-zA-Z0-9_-]*$/", $projectPreviousName) || !preg_match("/^[a-zA-Z0-9_-]*$/", $projectNewName)) {
                        $editProjectErr = "Only letters and numbers allowed in project name";
                    } else {
                        $editProjectErr = editProject($projectNewName, $projectPreviousName, $username);
                    }
                }
        }
    }
    $inviteLink = getInviteLink($username);
?>
<!DOCTYPE html>
<html lang="en">
    <head>
        <title>Water Quality Assessment</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0"> 
        <script src="./js/ol.js"></script>
        <link rel="shortcut icon" href="#"> <!--for netbeans favicon error-->
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta2/dist/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
        <script src="https://cdn.amcharts.com/lib/4/core.js"></script>
        <script src="https://cdn.amcharts.com/lib/4/charts.js"></script>
        <script src="https://cdn.amcharts.com/lib/4/themes/animated.js"></script>
        <script src="https://cdn.amcharts.com/lib/4/themes/kelly.js"></script>
        <script src="https://bossanova.uk/jspreadsheet/v4/jexcel.js"></script>
        <link rel="stylesheet" href="https://bossanova.uk/jspreadsheet/v4/jexcel.css" type="text/css" />
        <script src="https://jsuites.net/v4/jsuites.js"></script>
        <link rel="stylesheet" href="https://jsuites.net/v4/jsuites.css" type="text/css" />
        <link rel="stylesheet" href="./css/ol.css" type="text/css">
        <link rel="stylesheet" href="./css/globalClasses.css" type="text/css">
        <link rel="stylesheet" href="./css/mapStyle.css">
        <link rel="stylesheet" href="./css/navbar.css" type="text/css">
        <link rel="stylesheet" href="./css/inputContainer.css" type="text/css">
        
    </head>
    <body>   
        <nav class="navbar navbar-expand-lg">
            <div class="container-fluid">
                <h1 class="navbar-brand" href="#">Water Quality Assessment</h1>
                <div class="dropdown">
                    <div id="options" class="btn btn-outline-success" data-bs-toggle="dropdown" aria-expanded="false">
                        <button id="btnOptions"><?php echo $_SESSION["username"]; ?></button>
                        <svg id="btnOptionsSVG" xmlns="http://www.w3.org/2000/svg" width="16" height="16" color="white" fill="currentColor" class="bi bi-caret-down-fill" viewBox="0 0 16 16">
                            <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                        </svg>
                    </div>
                    <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton1">
                        
                        <li><button class="dropdown-item" onclick="showInviteModal()">Invite link</button></li>
                        <li><a id="btnLogout" class="dropdown-item" href="logout.php">Log out</a></li>
                    </ul>
                </div>
            </div>
        </nav>
        <div id="map" class="map container-fluid"></div>
        <div id="measurementDropDown" class="btn-group dropstart">
            <button id="selectMeasurementType" type="button" class="btn btn-secondary customControlButtons" data-bs-toggle="dropdown" aria-expanded="false">
                <img id="selectMeasurementTypeImage" src="./img/distance.png">
            </button>
            <ul id="measurementTypes" class="custom-dropdown-list dropdown-menu">
                <li id="length" class="my custom-dropdown-item dropdown-item">
                    <img id="lengthImage" src="./img/distance.png">
                </li>
                <li id="area" class="my custom-dropdown-item dropdown-item">
                    <img id="areaImage" src="./img/area.png">
                </li>
            </ul>
        </div>
        <div id="drawingDropDown" class="btn-group dropstart">
            <button id="selectDrawingType" type="button" class="btn btn-secondary customControlButtons" data-bs-toggle="dropdown" aria-expanded="false">
                <img id="selectDrawingTypeImage" src="./img/drawingLine.png">
            </button>
            <ul id="drawingTypes" class="custom-dropdown-list dropdown-menu">
                <li id="drawingPoint" class="custom-dropdown-item dropdown-item">
                    <img id="pointImage" src="./img/drawingPoint.png">
                </li>
                <li id="drawingLine" class="custom-dropdown-item dropdown-item">
                    <img id="lineImage" src="./img/drawingLine.png">
                </li>
                <li id="drawingPolygon" class="custom-dropdown-item dropdown-item">
                    <img id="polygonImage" src="./img/drawingPolygon.png">
                </li>
                <li id="drawingCircle" class="custom-dropdown-item dropdown-item">
                    <img id="polygonImage" src="./img/drawingCircle.png">
                </li>
            </ul>
        </div>
        
        <div id="panelContainer" class="col-lg-2 col-md-3 col-sm-4 forSmallScreens">
            <div id="togglePanelButton" class="pointerOnHover"><span id="togglePanelIcon" class="closePanelIcon"></span></div>
            <div id="coordinateContainer"><p id="coordinate"></p></div>
            <div id="panel" class="openPanel">
                <div>
                    <div class="row panelItemTitle justify-content-between mt-1 ps-1 pe-2">
                        <p class="col-10 p-0 m-0">Existing Projects</p>
                        <img id="newProject" class="col-1 p-0 pointerOnHover" src="./img/newProject.png" onclick="showCreateProjectModal()">
                    </div>
                    <div id="listOfProjects" class="itemsList me-2"></div>
                </div>
                <div>
                    <div class="row panelItemTitle justify-content-between mt-2 ps-1 pe-2">
                        <p class="col-10 p-0 m-0">Layers</p>
                    </div>
                    <div class="itemsList ps-1 me-2">
                        <div class="row justify-content-between m-0 my-2 ps-2 align-items-center">
                            <div class="col-9 p-0">
                                <input id="bingLayer" type="checkbox" checked="true" class="toggleLayer pointerOnHover"></input>
                                <spam class="ps-1">Background</spam>
                            </div>
                        </div>
                        <div class="row justify-content-between m-0 my-2 ps-2 align-items-center">
                            <div class="col-9 p-0">
                                <input id="riversLayer" type="checkbox" checked="true" class="toggleLayer pointerOnHover"></input>
                                <spam class="ps-1">Rivers</spam>
                            </div>
                        </div>
                        <div class="row justify-content-between m-0 my-2 ps-2 align-items-center">
                            <div class="col-9 p-0">
                                <input id="reservoirLayer" type="checkbox" checked="true" class="toggleLayer pointerOnHover"></input>
                                <spam class="ps-1">Reservoir</spam>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <div class="row panelItemTitle justify-content-between m-0 mt-4">
                        <div id="inputTab" class="tabHeader col-4 p-0 py-2 currentTabHeader pointerOnHover">Input</div>
                        <div id="resultTab" class="tabHeader col-4 p-0 py-2 pointerOnHover">Results</div>
                        <div id="legendTab" class="tabHeader col-4 p-0 py-2 pointerOnHover">Legend</div>
                    </div>
                    <div id="inputTabBody" class="tabBody m-0 currentTabBody p-2 mb-2">
                        <div class="row justify-content-between align-items-center m-0 p-0 my-2"><spam class="col-6 p-0 fontSize09">Branch #1:</spam><div id="B1Button" class="btn inutDataBtn col-5 p-1 py-2 fontSize09">Enter Data</div></div>
                        <div class="row justify-content-between align-items-center m-0 p-0 my-2"><spam class="col-6 p-0 fontSize09">Branch #2:</spam><div id="B2Button" class="btn inutDataBtn col-5 p-1 py-2 fontSize09">Enter Data</div></div>
                        <div class="row justify-content-between align-items-center m-0 p-0 my-2"><spam class="col-6 p-0 fontSize09">Environmental variables:</spam><div id="ENVButton" class="btn inutDataBtn col-5 p-1 py-2 fontSize09">Enter Data</div></div>
                        <div class="row justify-content-center align-items-center m-0 p-0 my-4"><button id="btnProcess" class="btn btn-primary col-10 p-1 py-2 fontSize09" style="border-radius: 20px; font-weight: bold;">Start Calculation</button></div>
                    </div>
                    <div id="resultTabBody" class="tabBody m-0 p-2 mb-2">
                        <!--<div class="row m-0 p-0 my-2">Select Index type:</div>
                        <div class="row m-0 p-0 my-2">
                            <div class="col-auto form-check pe-0">
                                <input class="form-check-input" type="radio" name="indexType" id="carlson" value="carlson" disabled>
                                <label class="form-check-label" for="carlson">Carlson</label>
                            </div>
                            <div class="col-auto form-check ms-2 pe-0">
                                <input class="form-check-input" type="radio" name="indexType" id="wrv" value="wrv" disabled>
                                <label class="form-check-label" for="wrv">WRV</label>
                            </div>
                        </div>-->
                        <div class="row justify-content-between align-items-center m-0 p-0 my-2"><spam class="col-12 p-0">Results for each 5 day:</spam></div>
                        <div class="range-wrap mx-2">
                            <div class="range-value" id="rangeV">day number: <spam id="rangeValue"></spam></div>
                            <input id="range" type="range" min="0" max="4" value="0" step="1" class="form-range row mx-0">
                        </div>
                        <div class="row m-0 my-2"><spam class="col-auto p-0">EPA Class:</spam><spam id="epa_class" class="col-auto fw-bolder px-2">-</spam></div>
                        <div class="row justify-content-between align-items-center m-0 p-0 my-3"><spam class="col-6 p-0 fontSize09">Carlson time series:</spam><button id="btnChart" class="btn btn-primary col-5 p-1 py-2 fontSize09">Show chart</button></div>
                    </div>
                    <div id="legendTabBody" class="tabBody m-0 p-2 mb-2">
                        <div class="row mx-0">
                            <h4 class="m-0 ps-0">Branches</h4>
                            <div class="row m-0 ps-3">
                                <spam class="col-4 p-0"><small>Branch 1</small></spam>
                                <div class="col p-0 ps-4">
                                    <svg height="20" width="40">
                                        <polyline points="0,5 15,15 25,5 40,15" style="fill:none;stroke:rgb(30,150,255);stroke-width:5" />
                                        Sorry, your browser does not support inline SVG.
                                    </svg>
                                </div>
                            </div>
                            <div class="row m-0 mt-2 ps-3">
                                <spam class="col-4 p-0"><small>Branch 2</small></spam>
                                <div class="col p-0 ps-4">
                                    <svg height="20" width="40">
                                        <polyline points="0,5 15,15 25,5 40,15" style="fill:none;stroke:rgb(0,0, 255);stroke-width:5" />
                                        Sorry, your browser does not support inline SVG.
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div class="row mt-4 mx-0">
                            <h4 class="m-0 ps-0">Reservoir</h4>
                            <div class="row m-0 ps-3">
                                <spam class="col-4 p-0"><small>No Result</small></spam>
                                <div class="col p-0 ps-4 pt-1">
                                    <svg height="30" width="40">
                                    <polygon points="1,1 39,1 39,19 1,19" style="fill:rgba(100,100,100,0.6);stroke:black;stroke-width:1" />
                                    Sorry, your browser does not support inline SVG.
                                </svg>
                                </div>
                            </div>
                            <div class="row m-0 ps-3">
                                <spam class="col-4 p-0"><small>DO output</small></spam>
                                <div class="col p-0 ps-2 mt-2">
                                    <svg height="60" width="220">
                                        <defs>
                                            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="5%" style="stop-color:rgb(0,255,0);stop-opacity:1" />
                                                <stop offset="50%" style="stop-color:rgb(255,255,0);stop-opacity:1" />
                                                <stop offset="95%" style="stop-color:rgb(255,0,0);stop-opacity:1" />
                                            </linearGradient>
                                        </defs>
                                        <polygon points="50,0 210,0 210,30 50,30" style="stroke:black;stroke-width:1" fill="url(#grad1)"  />
                                        <text fill="black" font-size="15" x="0" y="50">Value: 0</text>
                                        <text fill="black" font-size="15" x="190" y="50">100</text>
                                        Sorry, your browser does not support inline SVG.
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div id="inputContainer" class="col-8 px-3 narrowInputContainer">
            <div id="inputContainerTitle" class="row justify-content-between p-2">
                <h3 id="spreadSheetTitle" class="col-5 ps-3 m-0">Branch #1</h3>
                <div class="col-1 my-auto rightAlignText boldText"><spam class="pointerOnHover" id="close">X</spam></div>
            </div>
            <div id="tableContainer" class="mt-4 mb-4">
                <!--<table id="inputTable" class="table table-striped">
                    <thead>
                        <tr id="barnchesHeading">
                            <th scope="col" class="firstColumn"># of Day</th>
                            <th scope="col" class="otherColumns">Temp</th>
                            <th scope="col" class="otherColumns">PO4</th>
                            <th scope="col" class="otherColumns">NH4</th>
                            <th scope="col" class="otherColumns">NO3</th>
                            <th scope="col" class="otherColumns">CBOD</th>
                            <th scope="col" class="otherColumns">alga</th>
                            <th scope="col" class="otherColumns">DO</th>
                        </tr>
                        <tr id="EnvironmentalHeading">
                            <th scope="col" class="firstColumn"># of Day</th>
                            <th scope="col" class="otherColumns">T_air</th>
                            <th scope="col" class="otherColumns">Wind</th>
                            <th scope="col" class="otherColumns">Q_out</th>
                            <th scope="col" class="otherColumns">elevation</th>
                        </tr>
                    </thead>
                    <tbody id="B1SpreadSheet"></tbody>
                    <tbody id="B2SpreadSheet"></tbody>
                    <tbody id="EnvironmentalSpreadSheet"></tbody>
                </table>-->
                <div id="B1_sp" class="customSpreadSheet"></div>
                <div id="B2_sp" class="customSpreadSheet"></div>
                <div id="Env_sp" class="customSpreadSheet"></div>
            </div>
            <div class="row justify-content-start m-0">
                <div id="moreRows" class="col-auto btn btn-secondary">Adding 5 more rows</div>
                <div id="deleteRow" class="col-auto btn btn-secondary ms-3">Delete last row</div>
                <!--<div id="exportInputs" class="col-auto btn btn-secondary ms-3">Export to Excel</div>-->
            </div>
            <div class="row justify-content-end my-4 me-0">
                <div id="cancel" class="col-1 btn btn-danger me-2">Cancel</div>
                <button class="col-1 btn btn-primary" onclick="saveTable()">Save</button>
            </div>
        </div>
        <form id="createProjectModal" class="col-4" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]);?>" method="post">
            <div class="row">
                <div>
                    <div class="row justify-content-between m-0 mt-3 pb-3 align-items-center modalHeader">
                        <h3 class="col-auto m-0">Create new project</h3>
                        <button id="close1" type="button" class="btn-close col-auto me-3" onclick="hideModal(this)"></button>
                    </div>
                    <div class="row justify-content-between m-0 mt-4 pb-4 align-items-center">
                        <div class="col-10">
                            <label for="username" class="form-label">Enter project name</label>
                            <input id="projectName" type="text" class="form-control required_1" name="projectName">
                        </div>
                        <div class="col-10 d-flex justify-content-start">
                            <p id="warningProjectName" class="warning m-0"><?php echo $projectNameErr;?></p>
                        </div>
                    </div>
                    <div class="row justify-content-end m-0 pt-3 mb-3 align-items-center modalFooter">
                        <button id="close2" type="button" class="col-auto btn btn-danger me-2" onclick="hideModal(this)">Close</button>
                        <button type="submit" class="col-auto btn btn-primary me-3" name="submit" value="createProjectForm">Create project</button>
                    </div>
                </div>
            </div>
        </form>
        <form id="deleteProjectModal" class="col-4" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]);?>" method="post">
            <div class="row">
                <div>
                    <div class="row justify-content-between m-0 mt-3 pb-3 align-items-center modalHeader">
                        <h3 class="col-auto m-0">Delete project</h3>
                        <button id="close1" type="button" class="btn-close col-auto me-3" onclick="hideModal(this)"></button>
                    </div>
                    <div class="row justify-content-between m-0 mt-4 pb-4 align-items-center">
                        <div class="col-10">
                            <p id="deleteModalBody"></p>
                        </div>
                        <div class="col-10 d-flex justify-content-start">
                            <p id="warningDeleteProject" class="warning m-0"><?php echo $deleteProjectErr;?></p>
                        </div>
                    </div>
                    <div class="row justify-content-end m-0 pt-3 mb-3 align-items-center modalFooter">
                        <button id="close2" type="button" class="col-auto btn btn-danger me-2" onclick="hideModal(this)">Close</button>
                        <button type="submit" class="col-auto btn btn-primary me-3" name="submit" value="deleteProjct">Delete</button>
                    </div>
                </div>
            </div>
            <input id="deleteProjectName" name="deleteProjectName" type="hidden" value="">
        </form>
        <form id="editProjectModal" class="col-4" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]);?>" method="post">
            <div class="row">
                <div>
                    <div class="row justify-content-between m-0 mt-3 pb-3 align-items-center modalHeader">
                        <h3 class="col-auto m-0">Edit project</h3>
                        <button id="close1" type="button" class="btn-close col-auto me-3" onclick="hideModal(this)"></button>
                    </div>
                    <div class="row justify-content-between m-0 mt-4 pb-4 align-items-center">
                        <div class="col-10">
                            <label for="username" class="form-label">Enter a new name</label>
                            <input id="projectNewName" type="text" class="form-control required_1" name="projectNewName">
                            <input id="projectPreviousName" type="hidden" class="form-control required_1" name="projectPreviousName">
                        </div>
                        <div class="col-10 d-flex justify-content-start">
                            <p id="warningEditProject" class="warning m-0"><?php echo $editProjectErr;?></p>
                        </div>
                    </div>
                    <div class="row justify-content-end m-0 pt-3 mb-3 align-items-center modalFooter">
                        <button id="close2" type="button" class="col-auto btn btn-danger me-2" onclick="hideModal(this)">Close</button>
                        <button type="submit" class="col-auto btn btn-primary me-3" name="submit" value="editProject">Edit</button>
                    </div>
                </div>
            </div>
        </form>
        <div id="inviteModal" class="col-4">
            <div class="row">
                <div>
                    <div class="row justify-content-between m-0 mt-3 pb-3 align-items-center modalHeader">
                        <h3 class="col-auto m-0">Invite link</h3>
                        <button id="close1" type="button" class="btn-close col-auto me-3" onclick="hideModal(this)"></button>
                    </div>
                    <div class="row justify-content-between m-0 mt-4 pb-4 align-items-center">
                        <p id="inviteLink"><?php echo $inviteLink; ?></p>
                    </div>
                    <div class="row justify-content-end m-0 pt-3 mb-3 align-items-center modalFooter">
                        <button id="close2" type="button" class="col-auto btn btn-danger me-2" onclick="hideModal(this)">Close</button>
                        <button class="col-auto btn btn-primary me-3" onclick="copyInviteLink()">Copy link</button>
                    </div>
                </div>
            </div>
        </div>
        <div id="chart" class="row justify-content-end">
            <button id="closeChart" class="btn-close col-auto me-3 mt-3" onclick="hideChart(this)"></button>
            <div class="col-12 pe-0 m-0"><div id="chartDiv"></div></div>
        </div>
        <div id="disableDiv"></div>
        <div id='waitingSpinner' class='text-center'>
            <div class="spinner-border text-dark" style="width: 4rem; height: 4rem;" role="status"></div>
            <p class=""><strong>Processing...</strong></p>
        </div>
        <script src="./js/canvas2svg.js"></script>
        <script src="./js/createMap.js"></script>
        <script src="./js/panel.js"></script>
        <script src="./js/selectBranches.js"></script>
        <script src="./js/measurement.js"></script>
        <script src="./js/inputContainer.js"></script>
        <script src="./js/drawing.js"></script>
        <script src="./js/eventHandlers.js"></script>
        <script src="./js/exportChart.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta2/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>
    </body>
</html>
<?php
    if (!empty($projectNameErr)){
        echo "<script>document.getElementById(\"warningProjectName\").style.display = \"block\";showCreateProjectModal();</script>";
    }
    if (!empty($deleteProjectErr)){
        echo "<script>document.getElementById(\"warningDeleteProject\").style.display = \"block\";showDeleteProjectModal();</script>";
    }
    if (!empty($editProjectErr)){
        echo "<script>document.getElementById(\"warningEditProject\").style.display = \"block\";showEditProjectModal();</script>";
    }