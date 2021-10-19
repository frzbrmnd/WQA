<?php require_once("functions.php"); ?>  
<?php
    if ($_SERVER["REQUEST_METHOD"] == "POST"){
        if(isset($_POST["value"]) & isset($_POST["column"])){
            $value = test_input($_POST["value"]);
            $column = test_input($_POST["column"]);
            echo checkDuplicateUsernameOrEmail($column, $value);
        }
    }