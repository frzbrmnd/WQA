<?php session_start(); ?>
<?php require_once("functions.php"); ?> 
<?php
    $nameErr = $emailErr = $passwordErr = $querryErr = $errorMessage = "";
    $username = $email = $password = "";
    if ($_SERVER["REQUEST_METHOD"] == "POST"){
        if (empty($_POST["username"])) {
            $nameErr = "username is required. ";
        } else {
            $username = $_POST["username"];
            // check if name only contains letters and whitespace
            if (!preg_match("/^[a-zA-Z0-9_-]*$/",$username)) {
                $nameErr = "Wrong username";
            }
        }
        if (empty($_POST["password"])) {
            $passwordErr = "Password is required. ";
        } else {
            $password = test_input($_POST["password"]);
        }
        if(empty($nameErr) & empty($passwordErr)){
            $queryResult = checkUsernamePassword($username, $password);
            if ($queryResult){
                $_SESSION["username"] = $username;
                header("location: index.php");
            } else{
                $errorMessage2 = "Wrong username or password";
            }
        }else{
            $errorMessage = $nameErr.$passwordErr;
        }
    }
?>
<!DOCTYPE html>
<html lang="en">
    <head>
        <title>Login | Water Quality Assessment</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0"> 
        
        <link rel="shortcut icon" href="#"> <!--for netbeans favicon error-->
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
        <div class="row m-5">
            <div class="col-7">
                <div id="introduction" class="mt-5">
                    <h1 class="p-3">Lorem Impsum</h1>
                    <p class="px-3">Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                        sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
                        nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
                        reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                        pariatur.
                    </p>
                </div>
            </div>
            <div class="col-5">
                <form id="loginForm" class="row justify-content-center m-5" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]);?>" method="post">
                    <div id="title" class="col-10 mt-5 mb-4"><h1>Login</h1></div>
                    <div class="col-10 mb-3">
                        <label for="username" class="form-label">Username</label>
                        <input id="username" type="text" class="form-control" placeholder="username" aria-label="username" name="username" required>
                    </div>
                    <div class="col-10">
                        <label for="password" class="form-label">Password</label>
                        <input id="password" type="password" class="form-control" placeholder="password" aria-label="password" name="password" required>
                    </div>
                    <div class="col-10 d-flex justify-content-start mb-3">
                        <p id="warningPasswordLogin" class="warning"><?php echo $errorMessage2; ?></p>
                    </div>
                    <div class="col-10 d-flex justify-content-center my-4">
                        <button id="btnSubmit" type="submit" name="btnSubmit" class="btn btn-primary col-6">Login</button>
                    </div>
                    <div class="col-10 d-flex justify-content-center mt-3">
                        <p class="m-1">Do not have an account? <a href="signup.php">Sign up</a></p>
                    </div>
                </form>
            </div>
        </div> 
        <script>
            if (window.history.replaceState) {
                window.history.replaceState(null, null, window.location.href);
            }
        </script>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta2/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>
    </body>
</html>
<?php
    if (!empty($errorMessage)){
        echo "<script>document.getElementById(\"phpErrorMessage\").style.display = \"block\";</script>";
    }
    if (!empty($errorMessage2)){
        echo "<script>document.getElementById(\"warningPasswordLogin\").style.display = \"block\";</script>";
    }