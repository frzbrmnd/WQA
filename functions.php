<?php
    $password_db = "faraz@816#postgres";
    $host = "localhost";
    $name_db = "WQA";
    $port = 5432;
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
    function createNewUser($username, $email, $password){
        global $password_db, $host, $name_db, $port;
        $invite_code = createInviteCode(20);
        $db_connection = pg_connect("host={$host} port={$port} dbname={$name_db} user=postgres password={$password_db}") or die('connection failed' . pg_last_error());
        $query = "INSERT INTO users(username, email, password, invite_code) ";
        $query .= "VALUES ('{$username}', '{$email}', '{$password}', '{$invite_code}');";
        $result = pg_query($query);
        //$error= pg_result_error($result);
        if($result){
            $status = pg_affected_rows($result);
            pg_free_result($result);
            pg_close($db_connection);
            return $status; 
        }else{
            $error = pg_last_error($db_connection);
            if (preg_match('/duplicate/i', $error)){
                $outputmesage = "Either username or email has been taken"; 
            }
            pg_close($db_connection);
            return $outputmesage;
        }
    }
    
    function createInviteCode($length){
        global $password_db, $host, $name_db, $port;
        $chars = "0123456789abcdefghijklmnopqrstuvwxyz";
        $bool = "t";
        while($bool == "t"){
            $string = "";
            for ($p = 0; $p < $length; $p++) {
                $string .= $chars[mt_rand(0, strlen($chars))];
            }
            $db_connection = pg_connect("host={$host} port={$port} dbname={$name_db} user=postgres password={$password_db}") or die('connection failed' . pg_last_error());
            $query = "select exists(select 1 from users where invite_code='{$string}');";
            $result = pg_query($query);
            $bool = pg_fetch_row($result)[0];
            pg_free_result($result);
            pg_close($db_connection);
        }
        return $string;
    }
    
    function test_input($data) {
        return trim(stripslashes(htmlspecialchars($data)));
    }
    /*function test_input2($data, $dataName){
        if (empty($data)) {
            $error = "{$dataName} is required.";
            return $error;
        } else {
            // check if name only contains letters and whitespace
            if (!preg_match("/^[a-zA-Z0-9_-]*$/", $data)) {
                $error = "Only letters and numbers allowed in {$dataName}.";
                return $error;
            } else {
                return($data);
            }
        }
    }*/
    
    function checkDuplicateUsernameOrEmail($column, $value){
        global $password_db, $host, $name_db, $port;
        $db_connection = pg_connect("host={$host} port={$port} dbname={$name_db} user=postgres password={$password_db}") or die('connection failed' . pg_last_error());
        $query = "select exists(select 1 from users where {$column}='{$value}');";
        $result = pg_query($query);
        $bool = pg_fetch_row($result)[0];
        pg_free_result($result);
        pg_close($db_connection);
        if($bool == "t"){
            $status = "exist";
        }else{ 
            $status = "not exist";
        }
        return $status;
    }
    
    function checkUsernamePassword($username, $password){
        global $password_db, $host, $name_db, $port;
        $db_connection = pg_connect("host={$host} port={$port} dbname={$name_db} user=postgres password={$password_db}") or die('connection failed' . pg_last_error());
        $query = "select password from users where username='{$username}';";
        $result = pg_query($query);
        if (pg_num_rows($result) > 0){
            $passwordFromDB = pg_fetch_row($result)[0];                         
            if ($password == $passwordFromDB){                                  
                $status = TRUE;
            }            
        }
        pg_free_result($result);
        pg_close($db_connection);
        return $status;
    }
    
    function createNewProject($projectName, $username){
        global $password_db, $host, $name_db, $port;
        if(checkDuplicateProject($projectName, $username)){
            return "project exist";
        }
        $lastChange = date('Y-m-d H:i:s');
        $db_connection = pg_connect("host={$host} port={$port} dbname={$name_db} user=postgres password={$password_db}") or die('connection failed' . pg_last_error());
        $query = "INSERT INTO projects(project_name,last_change, username) VALUES ('{$projectName}', '{$lastChange}', '{$username}');";
        $result = pg_query($query);
        pg_free_result($result);
        pg_close($db_connection);
    }
    
    function checkDuplicateProject($projectName, $username){
        global $password_db, $host, $name_db, $port;
        $db_connection = pg_connect("host={$host} port={$port} dbname={$name_db} user=postgres password={$password_db}") or die('connection failed' . pg_last_error());
        $query = "select exists(select 1 from projects where username='{$username}' AND project_name='{$projectName}');";
        $result = pg_query($query);
        $bool = pg_fetch_row($result)[0];
        pg_free_result($result);
        pg_close($db_connection);
        if($bool == "t"){
            $status = TRUE;
        }else{ 
            $status = FALSE;
        }
        return $status;
    }
    
    function getProjectsNameAndId($username){
        global $password_db, $host, $name_db, $port;
        $existingProjects = array();
        $db_connection = pg_connect("host={$host} port={$port} dbname={$name_db} user=postgres password={$password_db}") or die('connection failed' . pg_last_error());
        $query = "select project_id, project_name from projects where username='{$username}' order by last_change desc;";
        $result = pg_query($query);
        while ($row = pg_fetch_row($result)){
            $project = array($row[0], $row[1]);
            array_push($existingProjects, $project);
        }
        pg_free_result($result);
        pg_close($db_connection);
        return $existingProjects;
    }
    
    function retriveData($id, $tableName){
        global $password_db, $host, $name_db, $port;
        $data = array();
        $db_connection = pg_connect("host={$host} port={$port} dbname={$name_db} user=postgres password={$password_db}") or die('connection failed' . pg_last_error());
        $query = "select * from {$tableName} where project_id={$id} order by day_number asc;";
        $result = pg_query($query);
        while ($row = pg_fetch_row($result)){
            array_push($data, $row);
        }
        pg_free_result($result);
        pg_close($db_connection);
        return $data;
    }

    function retriveVulSoc($id, $tableName){
        global $password_db, $host, $name_db, $port;
        $data = array();
        $db_connection = pg_connect("host={$host} port={$port} dbname={$name_db} user=postgres password={$password_db}") or die('connection failed' . pg_last_error());
        $query = "select * from {$tableName} where project_id={$id};";
        $result = pg_query($query);
        while ($row = pg_fetch_row($result)){
            array_push($data, $row);
        }
        pg_free_result($result);
        pg_close($db_connection);
        return $data;
    }       

    function retriveProjectId($username, $projectName){
        global $password_db, $host, $name_db, $port;
        $db_connection = pg_connect("host={$host} port={$port} dbname={$name_db} user=postgres password={$password_db}") or die('connection failed' . pg_last_error());
        $query = "select project_id from projects where username='{$username}' AND project_name='{$projectName}' limit 1;";
        $result = pg_query($query);
        $project_id = pg_fetch_row($result)[0];
        pg_free_result($result);
        pg_close($db_connection);
        return $project_id;
    }
    
    function checkDataFormat($data){
        for($i=0; $i<count($data); $i++){
            for($j=0; $j<count($data[$i]); $j++){
                if (!is_numeric($data[$i][$j])) {
                    return "Invalid input";
                }
            }
        }
        
    }
    
    function insertDataIntoTable($tableName, $username, $projectName, $data){
        global $password_db, $host, $name_db, $port;
        $project_id = retriveProjectId($username, $projectName);
        $db_connection = pg_connect("host={$host} port={$port} dbname={$name_db} user=postgres password={$password_db}") or die('connection failed' . pg_last_error());
        $query = "delete from {$tableName} where project_id={$project_id};";
        if($tableName == "environmental"){
            for($i=0; $i<count($data); $i++){
                $query .= "INSERT INTO {$tableName}(project_id, day_number, t_air, wind, q_out, elevation) ";
                $query .= "VALUES ({$project_id}, {$i}, {$data[$i][0]}, {$data[$i][1]}, {$data[$i][2]}, {$data[$i][3]});";
            }
        }else{
            for($i=0; $i<count($data); $i++){
                $query .= "INSERT INTO {$tableName}(project_id, day_number, q_in, temp, po4, nh4, no3, cbod, alga, do_1) ";
                $query .= "VALUES ({$project_id}, {$i}, {$data[$i][0]}, {$data[$i][1]}, {$data[$i][2]}, {$data[$i][3]}, {$data[$i][4]}, {$data[$i][5]}, {$data[$i][6]}, {$data[$i][7]});"; 
            }
        }
        $result = pg_query($query);
        $status = pg_affected_rows($result);
        pg_free_result($result);
        pg_close($db_connection);
        return $status; 
    }
    
    function deleteProject($projectName, $username){
        global $password_db, $host, $name_db, $port;
        $project_id = retriveProjectId($username, $projectName);
        $db_connection = pg_connect("host={$host} port={$port} dbname={$name_db} user=postgres password={$password_db}") or die('connection failed' . pg_last_error());
        $query = "delete from environmental where project_id={$project_id};";
        $query .= "delete from branch_1 where project_id={$project_id};";
        $query .= "delete from branch_2 where project_id={$project_id};";
        $query .= "delete from circles where project_id={$project_id};";
        $query .= "delete from lines where project_id={$project_id};";
        $query .= "delete from points where project_id={$project_id};";
        $query .= "delete from polygons where project_id={$project_id};";
        $query .= "delete from social where project_id={$project_id};";
        $query .= "delete from vulnerability where project_id={$project_id};";
        $query .= "delete from projects where project_name='{$projectName}' AND username='{$username}';";
        $result = pg_query($query);
        $status = pg_affected_rows($result);
        pg_free_result($result);
        pg_close($db_connection);
        return $status; 
    }
    
    function editProject($projectNewName, $projectPreviousName, $username){
        global $password_db, $host, $name_db, $port;
        if(checkDuplicateProject($projectNewName, $username)){
            return "there is another project with the same name!";
        }
        $db_connection = pg_connect("host={$host} port={$port} dbname={$name_db} user=postgres password={$password_db}") or die('connection failed' . pg_last_error());        
        $query = "UPDATE projects SET project_name='{$projectNewName}' WHERE project_name='{$projectPreviousName}' AND username='{$username}';";
        $result = pg_query($query);
        pg_free_result($result);
        pg_close($db_connection);
    }
    
    function convertArrayToPolygonString($coords){
        $stCoords = "ST_MakePolygon('LINESTRING(";
        for ($i=0; $i<count($coords[0]);$i++){
            $stCoords .= "{$coords[0][$i][0]} {$coords[0][$i][1]}";
            if($i == count($coords[0])-1){
                $stCoords .= ")')";
            }else{
                $stCoords .= ",";
            }
        }
        return $stCoords;
    }
    
    function convertArrayToPathString($coords){
        $stCoords = "'";
        for ($i=0; $i<count($coords);$i++){
            $stCoords .= "({$coords[$i][0]}, {$coords[$i][1]})";
            if($i == count($coords)-1){
                $stCoords .= "'";
            }else{
                $stCoords .= ",";
            }
        }
        return $stCoords;
    }
    
    function insertGeometryIntoTable($tableName, $username, $projectName, $coords, $featureId){
        global $password_db, $host, $name_db, $port;
        $project_id = retriveProjectId($username, $projectName);
        $db_connection = pg_connect("host={$host} port={$port} dbname={$name_db} user=postgres password={$password_db}") or die('connection failed' . pg_last_error());
        if ($tableName == "points"){
            $query = "insert into {$tableName} (project_id, geom, feature_id) values({$project_id}, POINT({$coords[0]}, {$coords[1]}), '{$featureId}');";
        }else if ($tableName == "lines"){
            $stCoords = convertArrayToPathString($coords);
            $query = "insert into {$tableName} (project_id, geom, feature_id) values({$project_id}, PATH({$stCoords}), '{$featureId}');";
        }else if ($tableName == "polygons"){
            $stCoords = convertArrayToPolygonString($coords);
            $query = "insert into {$tableName} (project_id, geom, feature_id) values({$project_id}, POLYGON({$stCoords}), '{$featureId}');";
        }
        $result = pg_query($query);
        pg_free_result($result);
        pg_close($db_connection);
    }
    
    function insertCircleIntoTable($tableName, $username, $projectName, $center, $radius, $featureId){
        global $password_db, $host, $name_db, $port;
        $project_id = retriveProjectId($username, $projectName);
        $db_connection = pg_connect("host={$host} port={$port} dbname={$name_db} user=postgres password={$password_db}") or die('connection failed' . pg_last_error());
        $query = "insert into {$tableName} (project_id, geom, feature_id) values({$project_id}, CIRCLE(POINT({$center[0]}, {$center[1]}), {$radius}), '{$featureId}');";
        $result = pg_query($query);
        pg_free_result($result);
        pg_close($db_connection);
    }
    
    function retriveFeatures($username, $projectName){
        global $password_db, $host, $name_db, $port;
        $features = array();
        $points = array();
        $lines = array();
        $polygons = array();
        $circles = array();
        $project_id = retriveProjectId($username, $projectName);
        $db_connection = pg_connect("host={$host} port={$port} dbname={$name_db} user=postgres password={$password_db}") or die('connection failed' . pg_last_error());
        $query1 = "select feature_id, geom from points where project_id={$project_id};";
        $result1 = pg_query($query1);
        while ($row = pg_fetch_row($result1)){
            $points[$row[0]] = $row[1];
        }
        $features["points"] = $points;
        pg_free_result($result1);
        $query2 = "select feature_id, geom from lines where project_id={$project_id};";
        $result2 = pg_query($query2);
        while ($row = pg_fetch_row($result2)){
            $lines[$row[0]] = $row[1];
        }
        $features["lines"] = $lines;
        pg_free_result($result2);
        $query3 = "select feature_id, geom from polygons where project_id={$project_id};";
        $result3 = pg_query($query3);
        while ($row = pg_fetch_row($result3)){
            $polygons[$row[0]] = $row[1];
        }
        $features["polygons"] = $polygons;
        pg_free_result($result3);
        $query4 = "select feature_id, geom from circles where project_id={$project_id};";
        $result4 = pg_query($query4);
        while ($row = pg_fetch_row($result4)){
            $circles[$row[0]] = $row[1];
        }
        $features["circles"] = $circles;
        pg_free_result($result4);
        pg_close($db_connection);
        return $features;
    }
    
    function deleteFeature($tableName, $username, $projectName, $featureId){
        global $password_db, $host, $name_db, $port;
        $project_id = retriveProjectId($username, $projectName);
        $db_connection = pg_connect("host={$host} port={$port} dbname={$name_db} user=postgres password={$password_db}") or die('connection failed' . pg_last_error());
        $query = "delete from {$tableName} where project_id={$project_id} AND feature_id='{$featureId}';";
        $result = pg_query($query);
        $status = pg_affected_rows($result);
        pg_free_result($result);
        pg_close($db_connection);
        return $status;
    }
    
    function alterCircle($tableName, $username, $projectName, $center, $radius, $featureId){
        global $password_db, $host, $name_db, $port;
        $project_id = retriveProjectId($username, $projectName);
        $db_connection = pg_connect("host={$host} port={$port} dbname={$name_db} user=postgres password={$password_db}") or die('connection failed' . pg_last_error());
        $query = "UPDATE {$tableName} SET geom=CIRCLE(POINT({$center[0]}, {$center[1]}), {$radius}) WHERE project_id={$project_id} AND feature_id='{$featureId}';";
        $result = pg_query($query);
        pg_free_result($result);
        pg_close($db_connection);
        
    }
    
    function alterGeometry($tableName, $username, $projectName, $coords, $featureId){
        global $password_db, $host, $name_db, $port;
        $project_id = retriveProjectId($username, $projectName);
        $db_connection = pg_connect("host={$host} port={$port} dbname={$name_db} user=postgres password={$password_db}") or die('connection failed' . pg_last_error());
        if ($tableName == "points"){
            $query = "UPDATE {$tableName} SET geom=POINT({$coords[0]}, {$coords[1]}) WHERE project_id={$project_id} AND feature_id='{$featureId}';";
        }else if ($tableName == "lines"){
            $stCoords = convertArrayToPathString($coords);
            $query = "UPDATE {$tableName} SET geom=PATH({$stCoords}) WHERE project_id={$project_id} AND feature_id='{$featureId}';";
        }else if ($tableName == "polygons"){
            $stCoords = convertArrayToPolygonString($coords);
            $query = "UPDATE {$tableName} SET geom=POLYGON({$stCoords}) WHERE project_id={$project_id} AND feature_id='{$featureId}';";
        }
        $result = pg_query($query);
        pg_free_result($result);
        pg_close($db_connection);
        
    }
    
    function getUsernameByInviteCode($inviteCode){
        global $password_db, $host, $name_db, $port;
        $code = test_input($inviteCode);
        $db_connection = pg_connect("host={$host} port={$port} dbname={$name_db} user=postgres password={$password_db}") or die('connection failed' . pg_last_error());
        $query = "select username from users where invite_code='{$code}'";
        $result = pg_query($query);
        $username = pg_fetch_row($result)[0];
        pg_free_result($result);
        pg_close($db_connection);
        if(empty($username)){
            return FALSE;
        }else{
            return $username;
        }
    }
    
    function getInviteLink($username){
        global $password_db, $host, $name_db, $port;
        $db_connection = pg_connect("host={$host} port={$port} dbname={$name_db} user=postgres password={$password_db}") or die('connection failed' . pg_last_error());
        $query = "select invite_code from users where username='{$username}'";
        $result = pg_query($query);
        $inviteCode = pg_fetch_row($result)[0];
        pg_free_result($result);
        pg_close($db_connection);
        if(empty($inviteCode)){
            return FALSE;
        }else{
            return "http://javehreservoir.com/index.php?guest=" . $inviteCode;
        }
    }
    
    function getDataToProcess($username, $projectName){
        $project_id = retriveProjectId($username, $projectName);
        $data = array();
        global $password_db, $host, $name_db, $port;
        $db_connection = pg_connect("host={$host} port={$port} dbname={$name_db} user=postgres password={$password_db}") or die('connection failed' . pg_last_error());
        $query = "SELECT branch_1.q_in, branch_1.temp, branch_1.po4, branch_1.nh4, branch_1.no3, branch_1.cbod, branch_1.alga, branch_1.do_1, branch_2.q_in, branch_2.temp, branch_2.po4, branch_2.nh4, branch_2.no3, branch_2.cbod, branch_2.alga, branch_2.do_1, environmental.t_air, environmental.wind, environmental.q_out, environmental.elevation ";
        $query .= "FROM ((branch_1 INNER JOIN branch_2 ON branch_1.day_number=branch_2.day_number) ";
        $query .= "INNER JOIN environmental ON branch_1.day_number=environmental.day_number) ";
        $query .= "WHERE branch_1.project_id={$project_id} AND branch_2.project_id={$project_id} AND environmental.project_id={$project_id};";
        $result = pg_query($query);
        while ($row = pg_fetch_row($result)){
            $day = array();
            for($i=0; $i<count($row); $i++){
                array_push($day, (float)$row[$i]);
            }
            array_push($data, $day);
        }
        pg_free_result($result);
        pg_close($db_connection);
        if(empty($data)){
            return FALSE;
        }else{
            return $data;
        }

    }
    
    function getResults($username, $projectName){
        $project_id = retriveProjectId($username, $projectName);
        $res = array();$chla = array();$do = array();
        global $password_db, $host, $name_db, $port;
        $db_connection = pg_connect("host={$host} dbname={$name_db} port={$port} user=postgres password={$password_db}") or die('connection failed' . pg_last_error());
        $query = "SELECT chla, do_1 from results where project_id={$project_id};";
        $result = pg_query($query);
        while ($row = pg_fetch_row($result)){
            array_push($chla, (float)$row[0]);
            array_push($do, (float)$row[1]);
        }
        array_push($res, $chla);
        array_push($res, $do);
        pg_free_result($result);
        pg_close($db_connection);
        if(empty($chla) || empty($do)){
            return FALSE;
        }else{
            return $res;
        }
    }
    function insertResults($username, $projectName, $chla, $do){
        $project_id = retriveProjectId($username, $projectName);
        global $password_db, $host, $name_db, $port;
        $db_connection = pg_connect("host={$host} dbname={$name_db} port={$port} user=postgres password={$password_db}") or die('connection failed' . pg_last_error());
        $query = "delete from results where project_id={$project_id};";
        
        for($i=0; $i<count($chla); $i++){
            $query .= "INSERT INTO results(project_id, chla, do_1) ";
            $query .= "VALUES ({$project_id}, {$chla[$i]}, {$do[$i]});";
        }
        $result = pg_query($query);
        $status = pg_affected_rows($result);
        pg_free_result($result);
        pg_close($db_connection);
        return $status;
    }
     
    function insertVulnerabilityInputs($username, $projectName, $inputs){
        $project_id = retriveProjectId($username, $projectName);
        global $password_db, $host, $name_db, $port;
        $db_connection = pg_connect("host={$host} dbname={$name_db} port={$port} user=postgres password={$password_db}") or die('connection failed' . pg_last_error());
        $query = "delete from vulnerability where project_id={$project_id};";
        $query .= "INSERT INTO vulnerability(project_id, rsc, aas, map, importDependence, aww, GNP_capita, stdap, arwr) ";
        $query .= "VALUES ({$project_id}, {$inputs[0]}, {$inputs[1]}, {$inputs[2]}, {$inputs[3]}, {$inputs[4]}, {$inputs[5]}, {$inputs[6]}, {$inputs[7]});";
        $result = pg_query($query);
        $status = pg_affected_rows($result);
        pg_free_result($result);
        pg_close($db_connection);
        return $status;
    }
   
    function insertSocialInputs($username, $projectName, $inputs){
        $project_id = retriveProjectId($username, $projectName);
        global $password_db, $host, $name_db, $port;
        $db_connection = pg_connect("host={$host} dbname={$name_db} port={$port} user=postgres password={$password_db}") or die('connection failed' . pg_last_error());
        $query = "delete from social where project_id={$project_id};";
        $query .= "INSERT INTO social(project_id, rifwrpc, hdi) ";
        $query .= "VALUES ({$project_id}, {$inputs[0]}, {$inputs[1]});";
        $result = pg_query($query);
        $status = pg_affected_rows($result);
        pg_free_result($result);
        pg_close($db_connection);
        return $status;
    }
    
   