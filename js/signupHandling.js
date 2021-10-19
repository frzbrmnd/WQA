var errorUsername = true; 
var errorEmail = true;
var errorPassword = true;
if (window.history.replaceState) {
    window.history.replaceState(null, null, window.location.href);
}
window.onload = function() {
    checkIfExistUsernameAndEmail("username", document.getElementById("username").value);
    checkIfExistUsernameAndEmail("email", document.getElementById("email").value);
};
function checkIfExistUsernameAndEmail(column, value){
    $.ajax({
        type : "POST",
        url : "signup_ajax_handler.php",
        data: {
            value: value,
            column: column
        },
        dataType: 'text',
        success : function(response) {
            var status = response.replace(/(\r\n|\n|\r|\s)/gm, "");
            if(status === "exist"){
                if (column === "username"){
                    document.getElementById("warningUsername").style.display='block';
                    document.getElementById("warningUsername").innerHTML = '"' + value + '" has already been taken. select another username';
                    errorUsername = false;
                }else{
                    document.getElementById("warningEmail").style.display='block';
                    document.getElementById("warningEmail").innerHTML = 'has already been taken';
                    errorEmail = false;
                }
            }else{
                if (column === "username"){
                    document.getElementById("warningUsername").style.display='none';
                    errorUsername = true;
                }else{
                    document.getElementById("warningEmail").style.display='none';
                    errorEmail = true;
                }
            }
        },
        error: function(xhr) { 
            
        }
    });
}
var required_1 = document.getElementsByClassName("required_1");
Array.prototype.forEach.call(required_1, function(element) {
    element.addEventListener('focusout', function() {   
        var value = element.value;
        var column = element.id;
        checkIfExistUsernameAndEmail(column, value);
    });    
});
document.getElementById("password2").addEventListener('focusout', function() {
    if(document.getElementById("password2").value !== document.getElementById("password1").value){
        document.getElementById("warningPassword").style.display='block';
        errorPassword = false;
    }else{
        document.getElementById("warningPassword").style.display='none';
        errorPassword = true;
    }
});
function validateForm(){
    return(errorUsername && errorEmail && errorPassword);
}