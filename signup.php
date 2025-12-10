<?php session_start(); ?>
<?php require_once("functions.php"); ?> 
<?php
    error_reporting(0);
    $nameErr = $emailErr = $passwordErr = $querryErr = $errorMessage = "";
    $username = $email = $password = "";
    if ($_SERVER["REQUEST_METHOD"] == "POST"){
        if (empty($_POST["username"])) {
            $nameErr = "username is required. ";
        } else {
            $username = $_POST["username"];
            // check if name only contains letters and whitespace
            if (!preg_match("/^[a-zA-Z0-9_-]*$/",$username)) {
                $nameErr = "Only letters and numbers allowed in username";
            }
        }
        if (empty($_POST["email"])) {
            $emailErr = "Email is required. ";
        } else {
            $email = test_input($_POST["email"]);
            // check if e-mail address is well-formed
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $emailErr = "Invalid email format. ";
            }
        }
        if (empty($_POST["password"])) {
            $passwordErr = "Password is required. ";
        } else {
            $password = test_input($_POST["password"]);
        }
        if(empty($nameErr) & empty($emailErr) & empty($passwordErr)){
            $queryResult = createNewUser($username, $email, $password);
            if ($queryResult == 1){
                $_SESSION["username"] = $username;
                header("location: index.php");
            } else {
                $errorMessage = "Email or username has been taken.";
            }
        }else{
            $errorMessage = $nameErr.$emailErr.$passwordErr;
        }
    }
?>
<!DOCTYPE html>
<html lang="en">
    <head>
        <title>Sign up | Javeh Reservoir</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0"> 
        <link rel="shortcut icon" href="./img/favicon.ico" type="image/x-icon">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta2/dist/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
        <link rel="stylesheet" href="./css/globalClasses.css" type="text/css">
        <link rel="stylesheet" href="./css/login.css" type="text/css">
    </head>
    <body> 
        <svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
            <symbol id="exclamation-triangle-fill" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
            </symbol>
        </svg>
        <div id="phpErrorMessage" class="alert alert-danger alert-dismissible fade show" role="alert">
            <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Danger:"><use xlink:href="#exclamation-triangle-fill"/></svg>
            <?php echo $errorMessage; ?>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
        <div class="row mx-0 mt-5 justify-content-center">
            <div class="col-4 mt-3">
                <form id="loginForm" class="row justify-content-center mx-3 p-1" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]);?>" method="post" onsubmit="return validateForm();">
                    <div id="title" class="col-10 mt-4 mb-3"><h1>Sign up</h1></div>
                    <div class="col-10">
                        <label for="username" class="form-label">Username</label>
                        <input id="username" type="text" class="form-control required_1" placeholder="Enter your username" name="username" required value="<?php echo $username;?>">
                    </div>
                    <div class="col-10 d-flex justify-content-start">
                        <p id="warningUsername" class="warning m-0"></p>
                    </div>
                    <div class="col-10 mt-3">
                        <label for="email" class="form-label">Email</label>
                        <input id="email" type="email" class="form-control required_1" placeholder="Enter your email address" name="email" required value="<?php echo $email;?>">
                    </div>
                    <div class="col-10 d-flex justify-content-start">
                        <p id="warningEmail" class="warning m-0"></p>
                    </div>
                    <div class="col-10 mt-3">
                        <label for="password1" class="form-label">Password</label>
                        <input id="password1" type="password" class="form-control" placeholder="Enter your password" name="password" required>
                    </div>
                    <div class="col-10 mt-3">
                        <label for="password2" class="form-label">Check password</label>
                        <input id="password2" type="password" class="form-control" placeholder="Retype your password" name="password2" required>
                    </div>
                    <div class="col-10 d-flex justify-content-start">
                        <p id="warningPassword" class="warning">Passwords are not equal</p>
                    </div>
                    <div class="col-10 d-flex justify-content-center my-4">
                        <button id="btnSubmit" type="submit" name="btnSubmit" class="btn btn-primary col-6">Sign up</button>
                    </div>
                    <div class="col-10 d-flex justify-content-center mt-2">
                        <p class="m-1">Already have an account? <a href="login.php">Login</a></p>
                    </div>
                </form>
            </div>
        </div> 
        <script src="./js/signupHandling.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta2/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>
    </body>
</html>
<?php
    if (!empty($errorMessage)){
        echo "<script>document.getElementById(\"phpErrorMessage\").style.display = \"block\";</script>";
    }