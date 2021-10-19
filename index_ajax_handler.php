<?php require_once("functions.php"); ?>  
<?php
    if ($_SERVER["REQUEST_METHOD"] == "POST"){
        if(isset($_POST["username"])){
            $username = test_input($_POST["username"]);
            echo json_encode(getProjectsNameAndId($username));
        }
        if(isset($_POST["currentProjectId"])){
            $id = test_input($_POST["currentProjectId"]);
            $data = array();
            array_push($data, retriveData($id, "branch_1"));
            array_push($data, retriveData($id, "branch_2"));
            array_push($data, retriveData($id, "environmental"));
            echo json_encode($data);
        }
        if(isset($_POST["projectUser"]) && isset($_POST["projectName"])){
            $username = test_input($_POST["projectUser"]);
            $projectName = test_input($_POST["projectName"]);
            echo json_encode(retriveProjectId($username, $projectName));
        }
        if(isset($_POST["tableName"]) && isset($_POST["tableData"]) && isset($_POST["tableUser"]) && isset($_POST["tableProjectName"])){
            $errorMessage = "";
            if($_POST["tableName"] == "Branch #1"){
                $tableName = "branch_1";
            }else if($_POST["tableName"] == "Branch #2"){
                $tableName = "branch_2";
            }else if($_POST["tableName"] == "Environmental Variables"){
                $tableName = "environmental";
            }else{
                $errorMessage = "wrong table name!";
            }
            $data = array_values(json_decode($_POST["tableData"], true));
            $errorMessage .= checkDataFormat($data);
            $username = test_input($_POST["tableUser"]);
            $projectName = test_input($_POST["tableProjectName"]);
            if(empty($errorMessage)){
                $numberOfInsertedRows = insertDataIntoTable($tableName, $username, $projectName, $data);
                echo "save table succsessfully";
            }else{
                echo $errorMessage;
            }
        }
        if(isset($_POST["type"]) && isset($_POST["coords"]) && isset($_POST["drawingUsername"]) && isset($_POST["drawingProjectName"]) && isset($_POST["featureId"])){
            $errorMessage = "";
            if($_POST["type"] == "Point"){
                $tableName = "points";
            }else if($_POST["type"] == "Polygon"){
                $tableName = "polygons";
            }else if($_POST["type"] == "LineString"){
                $tableName = "lines";
            }else{
                $errorMessage = "wrong geometry type!";
            }
            $coords = array_values(json_decode($_POST["coords"], true));
            
            $featureId = $_POST["featureId"];
            if (!preg_match("/^[a-zA-Z0-9_]*$/", $featureId)) {
                $errorMessage .= "Invalid id";
            }
            $username = test_input($_POST["drawingUsername"]);
            $projectName = test_input($_POST["drawingProjectName"]);
            if(empty($errorMessage)){
                echo insertGeometryIntoTable($tableName, $username, $projectName, $coords, $featureId);
            }else{
                echo $errorMessage;
            }
        }
        if(isset($_POST["type"]) && isset($_POST["center"]) && isset($_POST["radius"]) && isset($_POST["drawingUsername"]) && isset($_POST["drawingProjectName"]) && isset($_POST["featureId"])){
            $errorMessage = "";
            if($_POST["type"] == "Circle"){
                $tableName = "circles";
            }else{
                $errorMessage = "type of drawing must be defined";
            }
            $center = array_values(json_decode($_POST["center"], true));
            $radius = $_POST["radius"];
            if (!preg_match("/^[0-9.]*$/", $radius)) {
                $errorMessage .= "Radius must be a number";
            }
            $featureId = $_POST["featureId"];
            if (!preg_match("/^[a-zA-Z0-9_]*$/", $featureId)) {
                $errorMessage .= "Invalid id";
            }
            $username = test_input($_POST["drawingUsername"]);
            $projectName = test_input($_POST["drawingProjectName"]);
            if(empty($errorMessage)){
                echo insertCircleIntoTable($tableName, $username, $projectName, $center, $radius, $featureId);
            }else{
                echo $errorMessage;
            }
        }
        if(isset($_POST["retrievedrawingUsername"]) && isset($_POST["retrievedrawingProjectName"])){
            $username = test_input($_POST["retrievedrawingUsername"]);
            $projectName = test_input($_POST["retrievedrawingProjectName"]);
            echo json_encode(retriveFeatures($username, $projectName));
        }
        if(isset($_POST["deleteFeatureType"]) && isset($_POST["deleteDrawingUsername"]) && isset($_POST["deleteDrawingProjectName"]) && isset($_POST["deleteFeatureId"])){
            $errorMessage = "";
            $username = test_input($_POST["deleteDrawingUsername"]);
            $projectName = test_input($_POST["deleteDrawingProjectName"]);
            $featureId = $_POST["deleteFeatureId"];
            if (!preg_match("/^[a-zA-Z0-9_]*$/", $featureId)) {
                $errorMessage .= "Invalid id";
            }
            if($_POST["deleteFeatureType"] == "Point"){
                $tableName = "points";
            }else if($_POST["deleteFeatureType"] == "Polygon"){
                $tableName = "polygons";
            }else if($_POST["deleteFeatureType"] == "LineString"){
                $tableName = "lines";
            }else if ($_POST["deleteFeatureType"] == "Circle"){
                $tableName = "circles";
            }else{
                $errorMessage = "wrong geometry type!";
            }
            if(empty($errorMessage)){
                if(!deleteFeature($tableName, $username, $projectName, $featureId)){
                    echo "a problem has been occured";
                }
            }else{
                echo $errorMessage;
            }
        }
        if(isset($_POST["modifyFeatureType"]) && isset($_POST["modifyCenter"]) && isset($_POST["modifyRadius"]) && isset($_POST["modifyDrawingUsername"]) && isset($_POST["modifyDrawingProjectName"]) && isset($_POST["modifyFeatureId"])){
            $errorMessage = "";
            if($_POST["modifyFeatureType"] == "Circle"){
                $tableName = "circles";
            }else{
                $errorMessage = "type of drawing must be defined";
            }
            $center = array_values(json_decode($_POST["modifyCenter"], true));
            $radius = $_POST["modifyRadius"];
            if (!preg_match("/^[0-9.]*$/", $radius)) {
                $errorMessage .= "Radius must be a number";
            }
            $featureId = $_POST["modifyFeatureId"];
            if (!preg_match("/^[a-zA-Z0-9_]*$/", $featureId)) {
                $errorMessage .= "Invalid id";
            }
            $username = test_input($_POST["modifyDrawingUsername"]);
            $projectName = test_input($_POST["modifyDrawingProjectName"]);
            if(empty($errorMessage)){
                echo alterCircle($tableName, $username, $projectName, $center, $radius, $featureId);
            }else{
                echo $errorMessage;
            }
        }
        if(isset($_POST["modifyFeatureType"]) && isset($_POST["modifyCoords"]) && isset($_POST["modifyDrawingUsername"]) && isset($_POST["modifyDrawingProjectName"]) && isset($_POST["modifyFeatureId"])){
            $errorMessage = "";
            if($_POST["modifyFeatureType"] == "Point"){
                $tableName = "points";
            }else if($_POST["modifyFeatureType"] == "Polygon"){
                $tableName = "polygons";
            }else if($_POST["modifyFeatureType"] == "LineString"){
                $tableName = "lines";
            }else{
                $errorMessage = "wrong geometry type!";
            }
            $coords = array_values(json_decode($_POST["modifyCoords"], true));
            
            $featureId = $_POST["modifyFeatureId"];
            if (!preg_match("/^[a-zA-Z0-9_]*$/", $featureId)) {
                $errorMessage .= "Invalid id";
            }
            $username = test_input($_POST["modifyDrawingUsername"]);
            $projectName = test_input($_POST["modifyDrawingProjectName"]);
            if(empty($errorMessage)){
                echo alterGeometry($tableName, $username, $projectName, $coords, $featureId);
            }else{
                echo $errorMessage;
            }
        }
        if(isset($_POST["processUsername"]) && isset($_POST["processProjectName"])){        
            $username = test_input($_POST["processUsername"]);
            $projectName = test_input($_POST["processProjectName"]);
            echo json_encode(getDataToProcess($username, $projectName));
        }
        if(isset($_POST["getResultsChartUsername"]) && isset($_POST["getResultsChartProjectName"])){        
            $username = test_input($_POST["getResultsChartUsername"]);
            $projectName = test_input($_POST["getResultsChartProjectName"]);
            echo json_encode(getResults($username, $projectName));
        }
        if(isset($_POST["activateResultTabUsername"]) && isset($_POST["activateResultTabProjectName"])){        
            $username = test_input($_POST["activateResultTabUsername"]);
            $projectName = test_input($_POST["activateResultTabProjectName"]);
            echo json_encode(getResults($username, $projectName));
        }
        /*if(isset($_POST["insertResultsData"]) && isset($_POST["insertResultsUsername"]) && isset($_POST["insertResultsProjectName"])){        
            $username = test_input($_POST["insertResultsUsername"]);
            $projectName = test_input($_POST["insertResultsProjectName"]);
            $results = array_values(json_decode($_POST["insertResultsData"], true));
            echo insertResults($username, $projectName, $results);
        }*/
        
        if(isset($_POST["insertResultsDO"]) && isset($_POST["insertResultsChla"]) && isset($_POST["insertResultsUsername"]) && isset($_POST["insertResultsProjectName"])){        
            $username = test_input($_POST["insertResultsUsername"]);
            $projectName = test_input($_POST["insertResultsProjectName"]);
            $do = array_values(json_decode($_POST["insertResultsDO"], true));
            $chla = array_values(json_decode($_POST["insertResultsChla"], true));
            echo insertResults($username, $projectName, $chla, $do);
        }
    }