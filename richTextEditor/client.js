let textEditor = document.getElementById("mainEditor");
let initialTitle = document.getElementById("initialTitle");
//let templateP = document.getElementsByClassName("articleParagraph");
let frame = document.getElementsByClassName('Frame')[0];
let headers = document.getElementsByClassName('articleHeader');

console.log("browser:", navigator.userAgent.toLowerCase())
let pressed = false;
let pasted = false;
let data = undefined;
let mesgRecord = "";

let stringifiedDOM = [];

function DOMToJSON(DOMobj) {
    let jsonObj = {};

    if (DOMobj.nodeName == "#text") {

        jsonObj.nodeName = "#text";
        jsonObj.textContent = DOMobj.textContent;

        return jsonObj;
    }
    if (DOMobj.nodeName == "BR") {
        jsonObj.nodeName = "BR";

        return jsonObj;
    }
    //console.log("node:", DOMobj.nodeName);
    let childrenList = [];

    //jsonObj.class = DOMobj.className;

    for (let att of DOMobj.attributes) {
        //console.log(att.name, "---", att.value);
        if (att.name == "name") {
            jsonObj.name = DOMobj.getAttribute("name");
            continue;
        }
        jsonObj[att.name] = att.value;

    }
    jsonObj.localName = DOMobj.localName;
    for (let child of DOMobj.childNodes) {
        if (child.nodeName != "#comment") {
            let nextChild = DOMToJSON(child);
            childrenList.push(nextChild);
        }

    }
    jsonObj.childNodes = childrenList;
    return jsonObj;
};
function JSONToDOM(DOM) {
    if (DOM.nodeName == "#text") {
        let textNode = document.createTextNode("#text");
        textNode.textContent = DOM.textContent;
        return textNode;
    }
    if (DOM.nodeName == "BR") {
        let BR = document.createElement("br");
        return BR;
    }
    let element = document.createElement(`${DOM.localName}`);
    //console.log("DOM keys:", Object.keys(DOM));
    let atts = Object.keys(DOM);
    //console.log(typeof (atts));
    for (let k of atts) {
        //console.log(k);
        if (k == "class") {
            element['className'] = DOM[k];
        } else if (k == "contenteditable") {
            element.contentEditable = DOM[k];
        } else if (k == "name") {
            //console.log('name:!!!!!!!', DOM[k]);
            element.setAttribute("name", DOM[k]);
        }
        else {
            element[k] = DOM[k];
        }

    }
    for (let child of DOM.childNodes) {
        let childNode = JSONToDOM(child);
        element.appendChild(childNode);
    }
    return element;
}
function replaceNodes(parent, replaceNs) {
    console.log("in replacement:!!", parent, replaceNs);
    while (parent.children.length != 0) {
        parent.removeChild(parent.firstElementChild);
    }
    /* console.log("in replacement:!!", replaceNs.childNodes); */
    for (let i = 0; i < replaceNs.children.length; i++) {
        /* console.log("in replace:", replaceNs.children[i]) */
        if (replaceNs.children[i].className && replaceNs.children[i].className.includes("article")) {
            /* console.log("in replace:", replaceNs.children[i]) */
            let c = replaceNs.children[i].cloneNode(true);

            parent.appendChild(c);
        };

    }
    return;
}
let clickNode = null;
let clickEndNode = null;
let clickOffset = -1;
let clickEndOffset = -1;
let indx = -1;
let endIndx = -1;
let outIndx = -1;
let outEndIndex = -1;

//set cursor position after undo commands;
function setCursor(frame) {
    let selection = document.getSelection();
    let range = selection.getRangeAt(0);
    /* console.log("in set:", clickNode, clickEndNode, indx, endIndx, outIndx, outEndIndex); */
    if (clickEndNode == null || clickNode == null
        || (indx < 0 && clickNode == "#text") || endIndx < 0 && clickEndNode == "#text" || outIndx < 0 || outEndIndex < 0 ||
        outIndx >= frame.children.length || outEndIndex >= frame.children.length
        || indx >= frame.children[outIndx].childNodes.length ||
        endIndx >= frame.children[outEndIndex].childNodes.length) {
        return;
    }
    //console.log("set:cursor!!!!!", frame.children, frame.children[outIndx].childNodes[indx], frame.children[outEndIndex].childNodes[endIndx]);
    if (clickNode == "#text") {
        range.setStart(frame.children[outIndx].childNodes[indx], clickOffset);
    } else {
        console.log("hey!")
        range.setStart(frame.children[outIndx], clickOffset);
    }
    if (clickEndNode == "#text") {
        range.setEnd(frame.children[outEndIndex].childNodes[endIndx], clickEndOffset);
    } else {
        console.log("hey")
        range.setEnd(frame.children[outEndIndex], clickEndOffset);
    }

    selection.removeAllRanges();
    selection.addRange(range);
    return;

}

//save cursor status in the local memory indx, endIndx, outIndx, outEndIndx, 
//clickNode, clickEndNode, clickOffset, clickEndOffset
/* 1. indx contains the index of the first text node located which is selected
     inside p or h3 element (is only positive when the first node selected is 
        a text node)
   2. endIndx contains the index of the last text node which is selected
     inside p or h3 element(is only positive when the last node selected is 
        a text node)
   3. outIndx contains the index of first the p or h3 element which is selected
    relative to its parent 'frame'.
   4. outEndIndx contains the index of the p or h3 element where focus cursor
    relative to its parent 'frame'.
   5. clickNode (type string) contains nodeName of the 
       first p or h3 node which is being selected
   6. clickEndNode (type string) contains nodeName of the 
       last p or h3 node which is being selected
*/

function saveCursor() {
    let sel = document.getSelection();
    let ran = sel.getRangeAt(0);
    if (ran.startContainer.nodeName == "#text") {
        indx = Array.from(ran.startContainer.parentNode.childNodes).indexOf(ran.startContainer);
        //console.log("index:", Array.from(ran.startContainer.parentNode.childNodes).indexOf(ran.startContainer));
    } else {
        indx = 0;
    }
    if (ran.endContainer.nodeName == "#text") {
        endIndx = Array.from(ran.endContainer.parentNode.childNodes).indexOf(ran.endContainer);
        //console.log("endindex:", Array.from(ran.endContainer.parentNode.childNodes).indexOf(ran.endContainer));
    } else {
        endIndx = 0;
    }
    let stContainer = ran.startContainer.nodeName == "#text" ? ran.startContainer.parentNode : ran.startContainer;
    outIndx = Array.from(frame.children).indexOf(stContainer);
    let stOffset = ran.startOffset;
    let edContainer = ran.endContainer.nodeName == "#text" ? ran.endContainer.parentNode : ran.endContainer;
    let edOffset = ran.endOffset;
    outEndIndex = Array.from(frame.children).indexOf(edContainer);
    /* console.log("st:", ran.startContainer, stOffset, stContainer.childNodes.length, ran.startContainer.nodeName);
    console.log("end:", ran.endContainer, edOffset, edContainer, ran.endContainer.nodeName);
    console.log("outer:", outIndx, outEndIndex); */
    clickOffset = stOffset;
    clickEndOffset = edOffset;
    clickNode = ran.startContainer.nodeName;
    clickEndNode = ran.endContainer.nodeName;
}

function collapseText(editor, event, firstNodeClass) {
    event.preventDefault();

    //```save cursor position```
    saveCursor();
    let sel = getSelection();
    let range = sel.getRangeAt(0);
    //```save editor frame and inner DOM objects```
    let encodeDOM = DOMToJSON(frame);
    let stringified = JSON.stringify(encodeDOM);
    stringifiedDOM.push(stringified);
    /* console.log("saved:", stringifiedDOM); */
    let firstChild = editor.children[0].children[0].firstElementChild;
    let lastChild = editor.children[0].children[0].lastElementChild;
    let aNode = sel.anchorNode.nodeName == "#text" ? sel.anchorNode.parentNode : sel.anchorNode;
    /* console.log("anode:", aNode); */
    let leftOffset = aNode === firstChild ? sel.anchorOffset : sel.focusOffset;
    let rightOffset = aNode === firstChild ? sel.focusOffset : sel.anchorOffset;
    //let mesg = sel.anchorNode;

    let leftMsg = firstChild.textContent.slice(0, leftOffset);
    let rightMsg = lastChild.textContent.slice(rightOffset, lastChild.textContent.length);
    if (firstNodeClass == 'textEditorFrame') {
        leftMsg = "<br>";
        rightMsg = "<br>";
    }
    while (editor.children[0].children[0].children.length > 2) {
        // console.log("length:", textEditor.children[0].children[0].children.length)
        editor.children[0].children[0].removeChild(editor.children[0].children[0].firstElementChild.nextElementSibling);
    }
    /* console.log("left:", leftMsg, "right:", rightMsg, sel); */
    firstChild.innerHTML = leftMsg;
    lastChild.innerHTML = rightMsg;
    //range.setEnd(textEditor.children[0].children[0].firstElementChild, 0);
    let insertNode = document.createElement('p');
    insertNode.className = "articleParagraph";
    insertNode.setAttribute("name", "insertedParagraph");

    let br = document.createElement("BR");
    insertNode.appendChild(br);
    /* console.log("parent:", firstChild.nextElementSibling); */
    if (rightMsg.length && rightMsg != "<br>") {
        firstChild.parentNode.insertBefore(insertNode, firstChild.nextElementSibling);
    }

    range.setStart(firstChild.nextElementSibling, 0);
    //range.setEnd(firstChild.nextElementSibling, 0);
    console.log("collapsed!!!!");
    /* sel.removeAllRanges();
    sel.addRange(range); */
    sel.collapse(firstChild.nextElementSibling, 0);
}

function undo(DOMObj) {
    console.log("undo:");
    console.log(DOMObj);
}

frame.addEventListener("click", event => {

    let sel = document.getSelection();
    //console.log("click", sel);
    saveCursor();

    let leftMsg = "";
    let rightMsg = "";
    let selectedMsg = [];
    let anchor = sel.anchorNode.nodeName == "#text" ? sel.anchorNode.parentNode : sel.anchorNode;
    let focus = sel.focusNode.nodeName == "#text" ? sel.focusNode.parentNode : sel.focusNode;
    // console.log("focus", focus.nodeName == "H3" && focus.textContent);
    let contentNode = sel.anchorNode;
    // console.log("current:", anchor);
    let beforeMsg = contentNode.textContent.slice(0, sel.anchorOffset);
    let afterMsg = contentNode.textContent.slice(sel.anchorOffset, contentNode.textContent.length);
    while (contentNode.previousSibling) {

        contentNode = contentNode.previousSibling;
        if (contentNode.nodeName == "BR") {
            beforeMsg = "<br>" + beforeMsg;
        } else {
            beforeMsg = contentNode.textContent + beforeMsg;
        }

    }
    console.log("beforeMsg:", beforeMsg);
    contentNode = sel.anchorNode;
    while (contentNode.nextSibling) {
        contentNode = contentNode.nextSibling;
        if (contentNode.nodeName == "BR") {
            afterMsg = afterMsg + "<br>";
        } else {
            afterMsg = afterMsg + contentNode.textContent;
        }
    }
    console.log("after:", afterMsg)
    if (anchor.nodeName == "H3" || focus.nodeName == "H3") {
        if (anchor.nodeName == "H3" && anchor.textContent && focus.nodeName != "H3") {
            leftMsg = anchor.textContent.slice(0, sel.anchorOffset);
            if (focus.textContent) {
                rightMsg = focus.textContent.slice(sel.focusOffset, focus.textContent.length);
            }
            selectedMsg.push(anchor.textContent.slice(sel.anchorOffset, anchor.textContent.length));
            let cur = anchor;
            while (cur != null && cur != focus) {
                cur = cur.nextElementSibling;
                if (cur != focus) {
                    selectedMsg.push(cur.textContent);
                }
            }
            selectedMsg.push(focus.textContent.slice(0, sel.focusOffset));
            console.log("left and right msg:", leftMsg, rightMsg);
            console.log("selected msg:", selectedMsg);
        } else if (focus.nodeName == "H3" && focus.textContent && anchor.nodeName != "H3") {
            leftMsg = focus.textContent.slice(0, sel.focusOffset);
            if (anchor.textContent) {
                rightMsg = anchor.textContent.slice(sel.anchorOffset, anchor.textContent.length);
            }
            selectedMsg.push(focus.textContent.slice(sel.focusOffset, focus.textContent.length));
            let cur = focus;
            while (cur && cur != anchor) {
                // console.log(cur);
                cur = cur.nextElementSibling;
                if (cur != anchor) {
                    selectedMsg.push(cur.textContent);
                }
            }
            selectedMsg.push(anchor.textContent.slice(0, sel.anchorOffset));
            // console.log("second left and right msg:", leftMsg, rightMsg);
            // console.log("second selected msg:", selectedMsg);
        }
        if (anchor.nodeName == focus.nodeName && anchor === focus) {
            let leftOffset = sel.anchorOffset < sel.focusOffset ? sel.anchorOffset : sel.focusOffset;
            let rightOffset = sel.anchorOffset > sel.focusOffset ? sel.anchorOffset : sel.focusOffset;
            leftMsg = anchor.textContent.slice(0, leftOffset);
            rightMsg = anchor.textContent.slice(rightOffset, anchor.textContent.length);
            // console.log("left:", leftMsg, "right:", rightMsg);
        } else if (anchor.nodeName == focus.nodeName && anchor !== focus) {
            // console.log("anchor:", anchor, "focus:", focus)
            // console.log(sel.getRangeAt(0))
            let range = sel.getRangeAt(0);

            leftMsg = range.startContainer.textContent.slice(0, range.startOffset);
            rightMsg = range.endContainer.textContent.slice(range.endOffset);
            // console.log("start:", leftMsg, "end:", rightMsg);
        }
    }

})



textEditor.addEventListener("paste", async (event) => {

    //data collection for clipboard data
    let sel = document.getSelection();
    let anchor = sel.anchorNode.nodeName == "#text" ? sel.anchorNode.parentNode : sel.anchorNode;
    let focus = sel.focusNode.nodeName == "#text" ? sel.focusNode.parentNode : sel.focusNode;

    let str = JSON.stringify(event.clipboardData.getData('text'));

    let result = /.*(\r\n)+\"/g.exec(str);
    let trailingParagraph = 0;

    while (str.slice(str.length - 9, str.length - 1) == '\\r\\n\\r\\n') {
        str = str.slice(0, str.length - 9) + str[str.length - 1];
        trailingParagraph += 1;
    }
    // console.log("trailing:", trailingParagraph, str);
    // console.log("split:", str.split('\\r\\n\\r\\n'));
    str = str.slice(1, str.length - 1);
    let clipBoardArr = str.split('\\r\\n\\r\\n');
    for (let idx in clipBoardArr) {
        if (clipBoardArr[idx].includes('\\r\\n')) {
            let newElements = clipBoardArr[idx].split('\\r\\n');
            clipBoardArr.splice(idx, 1, ...newElements);
        }
    }
    // console.log(clipBoardArr)

    //TODO: need to write a function for this section

    // this session redefine the behavior of how to copy multiple lines of selected text data
    // and overwrite the currently selected multiple lines of text data and handle different
    // scenarioes 

    // scenario include 
    // 1. currently selected line is within a single line
    // 2. or currently selected lines are spreaded through multiple lines.
    if (anchor.nodeName == "H3" || focus.nodeName == 'H3') {
        event.preventDefault();
        let range = sel.getRangeAt(0);
        let startNode = range.startContainer.nodeName == "#text" ? range.startContainer.parentNode : range.startContainer;
        let cur = startNode;
        let endNode = range.endContainer.nodeName == "#text" ? range.endContainer.parentNode : range.endContainer;
        let nodesList = [];
        let mesgLeft = "";
        let mesgRight = "";
        let msgSelected = [];
        if (anchor.nodeName == "H3" && anchor.textContent && focus.nodeName != "H3") {
            mesgLeft = anchor.textContent.slice(0, sel.anchorOffset);
            if (focus.textContent) {
                mesgRight = focus.textContent.slice(sel.focusOffset, focus.textContent.length);
            }
            msgSelected.push(anchor.textContent.slice(sel.anchorOffset, anchor.textContent.length));
            let cur = anchor;
            while (cur && cur != focus) {
                cur = cur.nextElementSibling;
                if (cur) {
                    msgSelected.push(cur.innerHTML);
                }
            }
            msgSelected.push(focus.textContent.slice(0, sel.focusOffset));
            /* console.log("left and right msg:", mesgLeft, mesgRight);
            console.log("selected msg:", msgSelected); */
        } else if (focus.nodeName == "H3" && focus.textContent && anchor.nodeName != "H3") {
            mesgLeft = focus.textContent.slice(0, sel.focusOffset);
            if (anchor.textContent) {
                mesgRight = anchor.textContent.slice(sel.anchorOffset, anchor.textContent.length);
            }
            msgSelected.push(focus.textContent.slice(sel.focusOffset, focus.textContent.length));
            let cur = focus;
            while (cur != anchor) {
                // console.log(cur);
                cur = cur.nextElementSibling;
                msgSelected.push(cur.innerHTML);
            }
            msgSelected.push(anchor.textContent.slice(0, sel.anchorOffset));
            /* console.log("second left and right msg:", mesgLeft, mesgRight);
            console.log("second selected msg:", msgSelected); */
        } else if (anchor.nodeName == focus.nodeName && focus === anchor) {
            let leftOffset = sel.anchorOffset < sel.focusOffset ? sel.anchorOffset : sel.focusOffset;
            let rightOffset = sel.anchorOffset > sel.focusOffset ? sel.anchorOffset : sel.focusOffset;
            mesgLeft = anchor.textContent.slice(0, leftOffset);
            mesgRight = anchor.textContent.slice(rightOffset, anchor.textContent.length);
            // console.log("left:", mesgLeft, "right:", mesgRight);
        } else if (anchor.nodeName == focus.nodeName && anchor !== focus) {
            // console.log("anchor:", anchor, "focus:", focus)
            // console.log(sel.getRangeAt(0))
            let range = sel.getRangeAt(0);

            mesgLeft = range.startContainer.textContent.slice(0, range.startOffset);
            mesgRight = range.endContainer.textContent.slice(range.endOffset);
            // console.log("start:", mesgLeft, "end:", mesgRight);
        }
        while (cur != endNode) {
            // console.log("cur", cur);
            nodesList.push(cur);
            cur = cur.nextElementSibling;
        }
        nodesList.push(cur);
        // console.log(nodesList);


        // scenario 1: text content user selected are within a single line

        // in this case we need to erase all the text after the left cursor and
        // insert new lines (number of line = clip board array length - 1) and then
        // paste the text in the array to the corresponding line and then append the 
        // text after the right cursor to the last line. Set the cursor just before 
        // the text appended to the last line.
        if (anchor.nodeName == focus.nodeName && anchor === focus) {
            console.log("paste1!!!!!!!", anchor.lastElementChild, anchor.lastChild, anchor.lastChild != null)
            anchor.innerHTML = mesgLeft;
            if (anchor.lastChild != null) {
                console.log("'here!!!!!!!!'");
                range.setStartAfter(anchor.lastChild);
            }
            let insertAnchor = anchor.nextElementSibling;
            for (let i = 0; i < clipBoardArr.length; i++) {
                if (!i) {
                    anchor.innerHTML += clipBoardArr[i];
                    let cursorOffset = anchor.innerHTML.length;
                    if (i == clipBoardArr.length - 1) {
                        anchor.innerHTML += mesgRight;
                        console.log("lastChild:", anchor.lastChild, anchor.innerHTML.length);
                        if (anchor.lastChild != null) {
                            range.setStart(anchor.lastChild, cursorOffset);
                        }

                    }
                    continue;
                }
                let currentP = document.createElement('p');
                currentP.className = "articleParagraph";
                currentP.innerHTML = clipBoardArr[i].length > 0 ? clipBoardArr[i] : "<br>";

                anchor.parentElement.insertBefore(currentP, insertAnchor);
                if (i == clipBoardArr.length - 1) {

                    currentP.innerHTML += mesgRight;
                    if (currentP.lastChild) {
                        range.setStart(currentP.lastChild, clipBoardArr[i].length);
                    }
                }
            }
        }

        //scenario 2: the start and end containers are different head DOM nodes.
        else if (anchor.nodeName == focus.nodeName && anchor !== focus) {
            // console.log("needs implementation!!!!");
            let st = range.startContainer.nodeName == "#text" ? range.startContainer.parentElement : range.startContainer;
            let ed = range.endContainer.nodeName == "#text" ? range.endContainer.parentElement : range.endContainer;
            while (st.nextElementSibling != ed) {
                st.parentElement.removeChild(st.nextElementSibling);
            }
            if (clipBoardArr.length <= 1) {
                console.log(st, st.nextElementSibling);
                st.parentElement.removeChild(st.nextElementSibling);
                st.innerHTML = mesgLeft + (clipBoardArr[0] ? clipBoardArr[0] : "") + mesgRight;
                range.setStart(st.lastChild, mesgLeft.length);
                range.setEnd(st.lastChild, mesgLeft.length + (clipBoardArr[0] ? clipBoardArr[0].length : 0));
            } else {

                st.innerHTML = mesgLeft + clipBoardArr[0];
                ed.innerHTML = clipBoardArr[clipBoardArr.length - 1] + mesgRight;
                let insertAnchor = st.nextElementSibling;
                for (let i = 1; i < clipBoardArr.length - 1; i++) {
                    let nodeInsert = document.createElement('p');
                    nodeInsert.className = "articleParagraph";
                    nodeInsert.innerHTML = clipBoardArr[i].length > 0 ? clipBoardArr[i] : "<br>";

                    st.parentElement.insertBefore(nodeInsert, insertAnchor);
                }
                range.setStart(st.lastChild, mesgLeft.length);
                range.setEnd(ed.lastChild, (clipBoardArr.length > 1 ? clipBoardArr[clipBoardArr.length - 1].length : 0));
            }
        }

        // scenario 3: text content selected are spreaded through multiple lines

        // ... first we remove all the child nodes in between the first and last
        // nodes and if the clipBoard list length <= 1, we
        // remove the last child and append its remaining text and clipBoard data
        // after text of first line.

        // otherwise if the clip board length > 1, we append the first text data
        // in clip board array in the first line and right the remaining data
        // to the corresponding lines and finally append the mesgRight after the
        // last line of text

        else if (anchor.nodeName != focus.nodeName) {
            // console.log("scenario 3!!!", anchor)
            let headNode, tailNode;
            if (anchor.nodeName == "H3") {
                headNode = anchor;
                tailNode = focus;
            }
            else if (focus.nodeName == "H3") {
                headNode = focus;
                tailNode = anchor;
            }
            // console.log("scenario 3!!! left:", mesgLeft, "right:", mesgRight)
            while (headNode.nextElementSibling !== tailNode) {
                headNode.parentElement.removeChild(headNode.nextElementSibling);
            }
            if (clipBoardArr.length <= 1) {
                headNode.parentElement.removeChild(headNode.nextElementSibling);
                headNode.innerHTML = mesgLeft + (clipBoardArr[0] ? clipBoardArr[0] : "") + mesgRight;
                range.setStart(headNode.lastChild, mesgLeft.length);
                range.setEnd(headNode.lastChild, mesgLeft.length + (clipBoardArr[0] ? clipBoardArr[0].length : 0));
            }
            else {
                headNode.innerHTML = mesgLeft + clipBoardArr[0];
                tailNode.innerHTML = clipBoardArr[clipBoardArr.length - 1] + mesgRight;
                let insertAnchor = headNode.nextElementSibling;
                for (let i = 1; i < clipBoardArr.length - 1; i++) {
                    let nodeInsert = document.createElement('p');
                    nodeInsert.className = "articleParagraph";
                    nodeInsert.innerHTML = clipBoardArr[i].length > 0 ? clipBoardArr[i] : "<br>";

                    headNode.parentElement.insertBefore(nodeInsert, insertAnchor);
                }
                range.setStart(headNode.lastChild, mesgLeft.length);
                range.setEnd(tailNode.lastChild, (clipBoardArr.length > 1 ? clipBoardArr[clipBoardArr.length - 1].length : 0));
            }


        }

        // for (let idx in nodesList) {
        //     frame.removeChild(nodesList[idx])
        // }
        // console.log("prevent!", nodesList)


    }
    // console.log("in paste:", sel);   
    // console.log("in paste::!!!", event.clipboardData.getData("text/html"))
    let clipItems = event.clipboardData.items;
    // console.log("in clip:", event.clipboardData.getData('text/html'));
    for (let index in clipItems) {
        let item = clipItems[index];

        if (item.kind) {

        }
        if (item.kind == "file" && item.type.indexOf('image') != -1) {
            event.preventDefault();
            let blob = item.getAsFile();
            //console.log("blob data:", blob)
            let img = document.createElement('img');
            let urlImg = URL.createObjectURL(blob);
            img.src = urlImg;
            img.style = "height:500px;width:680px;"

            let selection = document.getSelection();
            let range = selection.getRangeAt(0);
            range.insertNode(img);
            range.setStartAfter(img);

        }

    }



    if (!event.clipboardData.items.length && textEditor.innerHTML == "") {

        initialTitle.style.visibility = "visible";
    }
    pressed = true;


})

let keyHistory = {};
let curLine = 0;
let textEditorStore = "";
textEditor.addEventListener("keydown", event => {
    //keyHistory = {};
    if (keyHistory['Control'] == "down" && event.key == "a") {
        console.log("sel:", getSelection().getRangeAt(0));
    }
    // console.log("current key:", event.key);
    console.log("control", keyHistory);
    keyHistory[event.key] = "down";
    if (event.key == "v") {
        if (keyHistory['Control']) {

        }
    }
    if (event.key == "Control" || event.key == "Shift") {
        keyHistory[event.key] = "down";
        return;
    }
    // undo:
    if (event.key == "z" && keyHistory["Control"] == "down") {
        console.log("undo!!!");
        if (!stringifiedDOM.length) {
            return;
        }
        let richT = document.getElementById("richText");
        //console.log("rich text editor:", richT, document.getSelection());


        let textEditorDecode = JSON.parse(stringifiedDOM[stringifiedDOM.length - 1]);
        console.log(textEditorDecode);



        let e = JSONToDOM(textEditorDecode);
        console.log("converted:", e, e.childNodes);
        console.log("before conversion:", richT, richT.childNodes);

        let rN = e;

        const r = rN;
        console.log('rn:', rN);

        replaceNodes(frame, r);
        setCursor(frame);
        stringifiedDOM.pop();
    }


    if (event.key == "Z" && keyHistory["Control"] == "down" && keyHistory["Shift"] == "down") {
        console.log("redo!!!");
        return;
    }

    let seli = textEditor.ownerDocument.defaultView.getSelection();
    let curNode = seli.focusNode;
    if (seli.anchorNode.nodeName != "#text") {
        console.log("up and down!!!!!!!!!!", seli.anchorOffset, seli.anchorNode.childNodes);
        let listN = [];
        for (let i = 0; i < seli.anchorOffset; i++) {
            let cur = seli.anchorNode.childNodes[i];
            if (cur.nodeName == "#text") {
                listN.push(cur.textContent);
            } else {
                listN.push('<br>');
            }
        }
        console.log("before:", listN);
        let listAfter = [];
        for (let i = seli.anchorOffset; i < seli.anchorNode.childNodes.length; i++) {
            let cur = seli.anchorNode.childNodes[i];
            if (cur.nodeName == "#text") {
                listAfter.push(cur.textContent);
            } else {
                listAfter.push('<br>');
            }
        }
        console.log("after:", listAfter, seli);
    }

    if (event.key == "ArrowUp" || event.key == "ArrowDown") {
        // console.log("up and down", event);
        if (curNode.nodeName == "H3") {
            if (event.key == "ArrowUp") {
                curLine -= 1;
            } else {
                curLine += 1;
            }
            // console.log("line:", curLine);

        }
    }


    let cn = seli.focusOffset ? seli.focusNode.parentElement : seli.focusNode;
    // console.log("type:", currentNode.nodeName);
    cn = cn.nodeName == "#text" ? cn.parentElement : cn;
    // console.log("tab inner html!!!:", curNode)

    if (event.key == "Tab") {
        event.preventDefault();
        let sel = textEditor.ownerDocument.defaultView.getSelection();
        let anchorOffsetStore = sel.anchorOffset;
        let focusOffsetStore = sel.focusOffset;
        let currentNode = seli.focusOffset ? seli.focusNode.parentElement : seli.focusNode;
        // console.log("type:", currentNode.nodeName);
        currentNode = currentNode.nodeName == "#text" ? currentNode.parentElement : currentNode;
        let tabKey = `\u00a0\u00a0\u00a0\u00a0`;

        // console.log("current mesg:", currentNode.childNodes[0])
        if (!currentNode.childNodes.length) {
            // console.log("here")
            let newText = document.createTextNode("");
            currentNode.appendChild(newText);
            /* console.log(currentNode.childNodes); */
        }
        let insertIndex = sel.anchorOffset;
        let curMesg = currentNode.childNodes[0].textContent;
        // console.log("tab inner html:", currentNode.childNodes[0])
        if (currentNode.childNodes[0].nodeName == "BR") {
            // console.log("br!!")

            currentNode.innerHTML = tabKey;
        } else {
            currentNode.childNodes[0].textContent = curMesg.slice(0, insertIndex) + tabKey + curMesg.slice(insertIndex);
        }

        //console.log("sel:", sel);
        //console.log("current child node:!!!", currentNode);
        let range = sel.getRangeAt(0);

        sel.setPosition(currentNode.childNodes[0], insertIndex + 4);


    }

    let sel = document.getSelection();

    let range = sel.getRangeAt(0);
    // console.log(sel);
    let selectedFirst = range.startContainer.parentElement;
    let selectedLast = range.endContainer.parentElement;

    if (range.commonAncestorContainer) {

    }

    let container = range.commonAncestorContainer;
    let containerFirst = range.commonAncestorContainer.firstElementChild;
    let containerLast = range.commonAncestorContainer.lastElementChild;
    let currentNode = null;
    // console.log("selection", sel)
    currentNode = sel.anchorNode;
    // console.log("current:", currentNode);
    currentNode = currentNode.nodeName == "#text" ? currentNode.parentNode : currentNode;

    //console.log(range.startOffset)

    if (event.key == "Enter") {
        console.log('enter pressed!!!!!!!!!!!!!!!', sel, range);
        //console.log("return!!!! shit:", keyHistory.hasOwnProperty("Shift"));
        if (keyHistory.hasOwnProperty("Shift")) {
            //console.log("down or up:", keyHistory["Shift"]);
            if (keyHistory["Shift"] == "down") {
                //console.log("return!");
                // console.log("new line:", sel);

                return;
            }
        }

        // console.log("currentnode:", currentNode);
        let firstNode = range.startContainer.nodeName == "#text" ? range.startContainer.parentNode : range.startContainer;
        let endNode = range.endContainer.nodeName == "#text" ? range.endContainer.parentNode : range.endContainer;
        /* console.log("meet?", firstNode); */


        if (firstNode.className == "textEditorFrame" || (firstNode.nodeName == "H3" && firstNode == textEditor.children[0].children[0].firstElementChild && endNode == textEditor.children[0].children[0].lastElementChild && endNode != firstNode)) {

            collapseText(textEditor, event, firstNode.className);


        } else if (currentNode.nodeName == "H3" && firstNode == endNode && range.startOffset == range.endOffset) {
            event.preventDefault();
            let listN = [];
            let beforeMsg = "";
            let listAfter = [];
            let afterMsg = "";
            if (seli.anchorNode.nodeName != "#text") {
                for (let i = 0; i < seli.anchorOffset; i++) {
                    let cur = seli.anchorNode.childNodes[i];
                    if (cur.nodeName == "#text") {
                        listN.push(cur.textContent);
                        beforeMsg += cur.textContent;
                    } else {
                        listN.push('<br>');
                        beforeMsg += '<br>';
                    }
                }
                console.log("before:", listN);

                for (let i = seli.anchorOffset; i < seli.anchorNode.childNodes.length; i++) {
                    let cur = seli.anchorNode.childNodes[i];
                    if (cur.nodeName == "#text") {
                        listAfter.push(cur.textContent);
                        afterMsg += cur.textContent;
                    } else {
                        listAfter.push('<br>');
                        afterMsg += '<br>';
                    }
                }
            } else {
                let contentNode = sel.anchorNode;
                let iterC = sel.anchorNode;
                console.log("current:", contentNode);
                beforeMsg = contentNode.textContent.slice(0, sel.anchorOffset);
                afterMsg = contentNode.textContent.slice(sel.anchorOffset, contentNode.textContent.length);
                while (iterC.previousSibling) {

                    iterC = iterC.previousSibling;
                    if (iterC.nodeName == "BR") {
                        beforeMsg = "<br>" + beforeMsg;
                    } else {
                        beforeMsg = iterC.textContent + beforeMsg;
                    }

                }
                console.log("beforeMsg:", beforeMsg);
                //contentNode = sel.anchorNode;
                while (contentNode.nextSibling) {
                    contentNode = contentNode.nextSibling;
                    if (contentNode.nodeName == "BR") {
                        afterMsg = afterMsg + "<br>";
                    } else {
                        afterMsg = afterMsg + contentNode.textContent;
                    }
                }
                console.log("afterMsg:", afterMsg);
            }
            //console.log("after:", listAfter, seli);
            // console.log("overwrite return!", sel, range, currentNode.textContent);
            let newParagraph = document.createElement('p');
            //newParagraph.addEventListener("click", event => { console.log("I am clicked!!!", sel) })
            newParagraph.className = "articleParagraph";
            newParagraph.setAttribute("name", "insertedParagraph");
            let mesg = sel.anchorNode;
            let leftMsg = currentNode.textContent.slice(0, sel.anchorOffset);
            let rightMsg = currentNode.textContent.slice(sel.anchorOffset, currentNode.textContent.length);

            currentNode.innerHTML = beforeMsg;
            newParagraph.innerHTML = afterMsg;
            if (!afterMsg.length) {
                newParagraph.innerHTML = "<br>";
            }
            currentNode.parentNode.insertBefore(newParagraph, currentNode.nextElementSibling);
            range.setStart(newParagraph, 0);
        }


    }
    let firstNode = range.startContainer.nodeName == "#text" ? range.startContainer.parentNode : range.startContainer;
    let endNode = range.endContainer.nodeName == "#text" ? range.endContainer.parentNode : range.endContainer;
    // console.log("range:", firstNode, endNode);
    if (event.key == "Backspace") {

        // console.log("backL", sel)
        if (textEditor.children[0].children[0].children.length == 1) {
            console.log("anchor:", sel)
            console.log(textEditor.children[0].children[0].children[0])
            if ((sel.anchorOffset == 0 && sel.focusOffset == 0) || textEditor.children[0].children[0].children[0].innerHTML.length == 0) {
                event.preventDefault();
                console.log("Backspace1")
            }
        }
        else if (textEditor.children[0].children.length == 2 && (sel.anchorOffset == 0) && sel.focusNode.className == "articleParagraph" && sel.focusNode.previousElementSibling) {

            // console.log("node offset:", sel.focusNode.previousElementSibling)
            event.preventDefault();

            console.log("Backspace2");
            textEditor.children[0].removeChild(textEditor.children[0].firstElementChild);

        } else if ((firstNode == endNode) && sel.anchorOffset == 0 && firstNode.textContent.length == 0 && range.startContainer == textEditor.children[0].children[0].children[0]) {
            console.log("first:", firstNode, range);
            if (textEditor.children[0].children[0].children.length == 2) {
                event.preventDefault();
            }
            textEditor.children[0].children[0].removeChild(textEditor.children[0].children[0].firstElementChild);

            console.log("Backspace3", textEditor.children[0].firstElementChild)
            range.setStart(textEditor.children[0].children[0].firstElementChild, 0);

        } else if ((firstNode == endNode) && sel.focusOffset == 0 && currentNode.previousElementSibling != null && !currentNode.previousElementSibling.textContent) {
            //remove previous paragraph when it is empty and the cursor is at 0 position of current paragraph
            console.log("in Backspace4", currentNode.previousElementSibling);
            event.preventDefault();
            textEditor.children[0].children[0].removeChild(currentNode.previousElementSibling);
        } else if (firstNode == textEditor.children[0].children[0].firstElementChild && endNode == textEditor.children[0].children[0].lastElementChild && endNode != firstNode) {
            event.preventDefault();
            console.log("in backspace 5")

            while (textEditor.children[0].children[0].children.length > 1) {
                // console.log("length:", textEditor.children[0].children[0].children.length)
                textEditor.children[0].children[0].removeChild(textEditor.children[0].children[0].lastElementChild);
            }
            textEditor.children[0].children[0].firstElementChild.innerHTML = "";
            textEditor.children[0].children[0].firstElementChild.appendChild(document.createElement("BR"));

            range.setStart(textEditor.children[0].children[0].firstElementChild, 0);

            sel.collapse(textEditor.children[0].children[0].firstElementChild, 0);

        }

        if (currentNode.className != "articleComponent") {
            // console.log("substitute node:", sel.focusNode);
            currentNode = sel.focusNode;
        }
    }



});


textEditor.addEventListener("keyup", event => {
    //event.preventDefault();
    if (event.key == "Control") {
        // keyHistory[event.key] = false;

    }
    keyHistory[event.key] = "up";

})
let url = "http://localhost:3000/POSTARTICLE"
let postBut = document.getElementById("postArticle");
/* postBut.addEventListener("click", event => {

    fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "text/plain;charset=utf8",
        },
        body: (textEditor.children[0].children[0].innerHTML)
    }).then(fulFillMsg => {
        console.log("response:", fulFillMsg);
    })
}); */