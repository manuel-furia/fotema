function popup(showhide){
  if(showhide === "showsignin"){
    document.getElementById('signin-popup').style.visibility="visible";
    document.getElementById('signup-popup').style.visibility = "hidden";
  }

  if(showhide === "hidesignin"){
    document.getElementById('signin-popup').style.visibility="hidden";
  }

  if(showhide ==="showsignup"){
    document.getElementById('signup-popup').style.visibility = "visible";
    document.getElementById('signin-popup').style.visibility="hidden";
  }

  if(showhide ==="hidesignup"){
    document.getElementById('signup-popup').style.visibility = "hidden";

  }
}
