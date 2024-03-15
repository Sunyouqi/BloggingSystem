let textEditor = document.getElementById("mainEditor");
let initialTitle = document.getElementById("initialTitle");

let pressed = false;
let pasted = false;
let data = undefined;

textEditor.oncopy = function (event) {
    console.log("in copy event!!!!");
}

navigator.clipboard.addEventListener("clipboardchange", event => {
    console.log("clipboard changed!!!!dasdsadasdsad", event)
});

textEditor.addEventListener("paste", (event) => {

    //console.log("pasting:", currentText)
    //await navigator.clipboard.writeText('<p>hi</p>')
    let fileV = event.clipboardData.items[0].getAsFile("image");
    if (fileV) {
        //console.log("file size:", fileV.length)
        let reader = new FileReader();
        reader.onload = event => {
            //console.log("file size:", event.target.result.length);
            data = event.target.result;
        }
        reader.readAsDataURL(fileV);
    }


    pasted = true;
    let regEx = /\<p\>(?<prefix>\<img src\=)(.*)(?<suffix>\>)\<\/p\>/g;
    //console.log("inner1:", textEditor.innerHTML);
    let match = regEx.exec(textEditor.innerHTML);
    let pathIMAGE = '\"./photo.jpg\"';
    //console.log(pathIMAGE);
    if (match) {
        textEditor.innerHTML = textEditor.innerHTML.replace(regEx, `$<prefix>${pathIMAGE} style = "height:500px;width:680px;"$<suffix>`);
    }

})

textEditor.addEventListener("keydown", event => {
    initialTitle.style.visibility = "hidden";
    //console.log(event.target.innerHTML.length);
    //console.log("content:", event.target.innerHTML)
    //console.log(event.key)
    if (event.key == "Backspace" && textEditor.innerHTML == "") {
        //console.log("here??")
        initialTitle.style.visibility = "hidden";
        pressed = true;

    } else {
        pressed = false;
    }
    if (event.key == "Tab") {
        event.preventDefault();
        let sel = textEditor.ownerDocument.defaultView.getSelection();

        let tabKey = `\u00a0\u00a0\u00a0\u00a0`;
        let newP = document.createTextNode(tabKey);


        let range = sel.getRangeAt(0);
        range.insertNode(newP);

        //range.setEndAfter(newP);
        range.setStartAfter(newP);


    }


});
textEditor.addEventListener("keyup", event => {
    event.preventDefault();

    if (event.key == "Backspace" && textEditor.innerHTML == "") {

        //initialTitle.style.visibility = "hidden";
        //console.log("prevent")
    }
    let reg = /^\<.{0,3}?\>\<.{0,3}?\>\<\/.{0,3}?\>$/g;
    //console.log("find????", reg.exec(event.target.innerHTML))
    let matchE = reg.exec(event.target.innerHTML);
    if (event.target.innerHTML == "<br>" || matchE) {
        initialTitle.style.visibility = "visible";
        event.target.innerHTML = "";
    }
    if (event.target.innerHTML.length == 0 && pressed == false) {
        //console.log("here!!!")
        initialTitle.style.visibility = "visible";
        pressed = false;
    }


})
let url = "http://localhost:3000/POSTARTICLE"
let postBut = document.getElementById("postArticle");
postBut.addEventListener("click", event => {
    //console.log(textEditor.innerHTML)
    fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "text/plain;charset=utf8",
        },
        body: (textEditor.innerHTML)
    }).then(fulFillMsg => {
        console.log("response:", fulFillMsg);
    })
});