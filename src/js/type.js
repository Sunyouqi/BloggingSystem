
//FUCK!!!!!!! NO ZUO NO DIE WHY YOU TRY!!!!!

////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
// rich text Editor functions development:  
//    a. Customized Editor Element                                       ///////////
//      1. undo (implemented needs testing)                             //////////
//      2. redo  (implemented needs testing)                            //////////        
//      3. firefox enter  (under development)
//      4  firefox backspace (under development)                         //////////    
//      6. copy                                                          /////////
//      7. paste                                                         /////////
//      ...                                                              ///////////
/////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
//TODO:
//     debug required for undo redo and enter funtions on firefox before moving on
//     to implement copy and paste.
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////


//////////////////////////////////////////////////////////////////////////////////////////
//getLatestUndoCursor
//getLatestUndoState

//*****************************************undo****************************************
//          saveState
//
//          SaveCursor
//                      --getCursorInfor
//                      --getLatestUndoState
//                      --setCursorObj
//          restoreState
//          restoreCursor
//                      --determineAnchorFocusSequence
//
//**************************************************************************************

//saveState
//restoreState
//getCursorInfor
//setCursorObj
//saveCursor
//determineAnchorFocusSequence
//restoreCursor(needs fixing when setting cursors)

//*****************************************redo****************************************
//          restoreState
//
//
//
//          restoreCursor
//                      --determineAnchorFocusSequence
//
//
//**********************************************************************************

//          clearRedo
//          alignFirstCursor
//          alignLastCursor
//          extractCursorObj
//          determineSelectedAll
//          handleClick
//          deleteAllChildrenExceptThefirst

//****************************************fireFoxEnter********************************
//          getLatestUndoCursor
//          determineAnchorFocusSequence
//          deleteAllChildrenExceptTheFirst
//
//******************************************************************************

//handleKeyUp
//****************************************fireFoxBackSpace****************************************
//          getCursorInfor
//          getLatestUndoState
//          determineSelectedAll
//                          --getCursorInfor
//                          --extractCursorObj
//                                              ====determineAnchorFocusSequence
//                          --alignFirstCursor
//                          --alignLastCursor
//
//          deleteAllChildrenExceptTheFirst
//**************************************************************************************************

//handleKeyDown
////////////////////////////////

////development plan:
////   need to construct method classes for 
////   1. clicking(get anchor focus cursor information determine which comes first)
////   2. GETCURSORINFO need to be in a separate class
import navigatorBar from './local_modules/navigatorBar/nav.js'

import {
    getCursorInforF, cursorBugF, determineAnchorFocusSequenceF,
    setCursorObjF, alignFirstCursorF, alignLastCursorF,
    extractCursorObjF, determineSelectedAllF
} from './local_modules/cursor.js'


class Editor extends HTMLElement {

    static browser = "";
    static keyHistory;
    static selectedAll;
    static undoNodes;
    static undoCursorQueue;
    static redoNodes;
    static redoCursorQueue;
    static initialize = 0;

    constructor() {
        super();

    }
    connectedCallback() {
        if (!Editor.initialize) {
            Editor.browser = navigator.userAgent.toLowerCase();
            Editor.keyHistory = {};
            Editor.selectedAll = false;
            Editor.cursorStart = false;
            Editor.undoNodes = [];
            Editor.undoCursorQueue = [];
            Editor.redoNodes = [];
            Editor.redoCursorQueue = [];
            Editor.initialize = 1;
        }
        this.addEventListener("keyup", this.handleKeyUp.bind(this));
        this.addEventListener("keydown", this.handleKeyDown, { capture: true });
        this.addEventListener("click", this.handleClick.bind(this));
        this.addEventListener("paste", this.handlePaste.bind(this));
        this.addEventListener('scroll', this.scrollHandler.bind(this));
        this.focus();
    }
    scrollHandler(event) {
        console.log("scroll event:", event);
    }
    async handlePaste(event) {
        //event.preventDefault();
        let clipBoardData = await navigator.clipboard.read();

        for (let d of clipBoardData) {
            console.log(d, d.types);
            for (let t of d.types) {
                let c = await d.getType(t);
                let typeArr = t.split('/')
                console.log(c, typeArr[0]);
                if (typeArr[0] == "text") {
                    let text = await c.text();
                    console.log(text.split('\n'));
                }

                if (t == "text/html") {
                    console.log("html!!!!");
                }
            }
        }
        /* let texture = await navigator.clipboard.readText();
        console.log("text", texture); */
        return;
    }
    getLatestUndoCursor() {
        return Editor.undoCursorQueue[Editor.undoCursorQueue.length - 1];
    }
    getLatestUndoState() {
        return Editor.undoNodes[Editor.undoNodes.length - 1];
    }

    undo(event) {
        event.preventDefault();

        let node = this.cloneNode(true);

        this.saveState("redo", node);
        this.saveCursor("redo");

        this.restoreState("undo");
        this.restoreCursor("undo");
        return;
    }
    saveState(action, node) {

        //save the state of current editor

        if (action == "undo") {
            Editor.undoNodes.push(node);
        } else {
            Editor.redoNodes.push(node);
        }

        return;

    }
    restoreState(action) {
        let nodesList = Editor.redoNodes;
        if (action == "undo") {
            nodesList = Editor.undoNodes;
        }
        if (nodesList.length == 0) {
            return;
        }


        let r = nodesList[nodesList.length - 1];


        while (this.childNodes.length) {
            this.removeChild(this.lastChild);
        }
        while (r.childNodes.length) {

            let l = r.firstChild;
            r.removeChild(r.firstChild);
            this.appendChild(l);

        }
        nodesList.pop();


    }

    saveCursor(action) {


        let cursorObj = getCursorInforF(this, Editor);
        if (Editor.browser.includes("firefox")) {
            let lastState = this.getLatestUndoState();
            if (Editor.selectedAll) {
                //console.log("in save cursor last state:", lastState, lastState.lastElementChild.lastChild.previousSibling);
                setCursorObjF(cursorObj, "HEADER-ELEMENT", 1, 0, 0, "HEADER-ELEMENT", lastState.children.length,
                    lastState.lastElementChild.childNodes.length - 1,
                    0,
                    lastState.firstElementChild,
                    lastState.lastElementChild
                );
            }
            if (cursorObj.oIA === 3 && cursorObj.aIA === 1 && cursorObj.oIF === 3 && cursorObj.aIF === 1
                && Math.abs(cursorObj.oA - cursorObj.oF) === 1) {
                setCursorObjF(cursorObj, "HEADER-ELEMENT", cursorObj.oA, 0, 0, "HEADER-ELEMENT", cursorObj.oA,
                    this.childNodes[cursorObj.oA].childNodes.length - 1,
                    0,
                    this.childNodes[cursorObj.oA],
                    this.childNodes[cursorObj.oA]
                );
            }
        }

        if (action == "undo") {
            Editor.undoCursorQueue.push(cursorObj);
        } else {
            Editor.redoCursorQueue.push(cursorObj);
        }
        return;
    }
    restoreCursor(action) {
        /* let cursorObj = {
            aT: ancestorAnchorType,
            oIA: outerIndexA,
            aIA: ancestorIndxA,
            oA: offsetAnchor,
            fT: ancestorFocusType,
            oIF: outerIndexF,
            aIF: ancestorIndxF,
            oF: offsetFocus,
            cAN: curAnchorNode,
            cFN: curFocusNode,
        } */
        let cursorQueue = Editor.redoCursorQueue;
        if (action == "undo") {
            cursorQueue = Editor.undoCursorQueue;
        }
        if (!cursorQueue.length) {
            return;
        }

        let sel = getSelection();
        let range = sel.getRangeAt(0);
        let cur = cursorQueue[cursorQueue.length - 1];
        var containerA = this;
        var containerF = this;

        if (cur.aT == "HEADER-ELEMENT") {
            containerA = containerA.childNodes[cur.oIA];

        }
        if (cur.fT == "HEADER-ELEMENT") {
            containerF = containerF.childNodes[cur.oIF];
        }

        if (cur.oIA == 1 && cur.aIA == 0 && cur.oA == 0) {
            Editor.cursorStart = true;
        } else {
            Editor.cursorStart = false;
        }
        let f = determineAnchorFocusSequenceF(cur);

        if (f) {
            range.setStart(containerA.childNodes[cur.aIA], cur.oA);
            range.setEnd(containerF.childNodes[cur.aIF], cur.oF);
        } else {
            range.setEnd(containerA.childNodes[cur.aIA], cur.oA);
            range.setStart(containerF.childNodes[cur.aIF], cur.oF);
        }

        cursorQueue.pop();
        return;
    }

    redo() {
        this.restoreState("redo");
        this.restoreCursor("redo");
        return;
    }
    clearRedo() {
        Editor.redoNodes = [];
        Editor.redoCursorQueue = [];
        return;
    }

    handleClick(event) {
        //testScope()();
        //Editor.doubleClicked = false;
        let node = this.cloneNode(true);
        this.saveState("undo", node);
        this.saveCursor("undo");
        let childList = this.lastElementChild.childNodes;
        let lastMsg = this.lastElementChild.childNodes.length > 1 ?
            childList[childList.length - 2] : childList[childList.length - 1];
        let textIndex = childList.length - 1;
        //console.log("text index:", textIndex, childList,)
        while (childList[textIndex].nodeName !== "#text" && textIndex) {
            textIndex--;
        }

        // need to handle the situation when alt + a pressed and user hold shift and click
        // the end of the container.
        // still need polishing ...

        if (Editor.selectedAll) {
            /* console.log("key history:", Editor.keyHistory); */
            let LAST = false;
            if (Editor.keyHistory["Shift"] == "Down") {
                Editor.selectedAll = false;
                LAST = alignLastCursorF(extractCursorObjF(getCursorInforF(this, Editor)).last, this);
                /* console.log('last?:', LAST, this.extractCursorObj(this.getLatestUndoCursor()).last); */
                Editor.selectedAll = true;
            }
            if (!LAST) {
                Editor.selectedAll = false;
            }

        }

        let cursor = getCursorInforF(this, Editor);
        console.log(cursor);
        if (Editor.keyHistory["Shift"] == "Up") {
            let cursor = getCursorInforF(this, Editor);
            if ((cursor.oIA == 1 && cursor.aIA == 0 && cursor.oA == 0)
                && Editor.cursorStart
            ) {
                let sel = getSelection();
                let range = sel.getRangeAt(0);

                let { first, last } = extractCursorObjF(cursor);

                let curNode = last.lastTextOffset >= 0 ? last.lastParaDiv.childNodes[last.lastNodeOffset] : last.lastParaDiv;
                let offsetN = last.lastTextOffset >= 0 ? last.lastTextOffset : 0;
                switch (curNode.nodeName) {
                    case "BR": {
                        offsetN = 0;
                    }
                    case "#text": {
                        offsetN = offsetN >= curNode.textContent.length ? curNode.textContent.length - 1 : offsetN;
                    }
                    case "HEADER-ELEMENT": {
                        offsetN = offsetN >= curNode.childNodes.length ? curNode.childNodes.length - 1 : offsetN;
                    }
                }
                offsetN = offsetN < 0 ? 0 : offsetN;
                console.log("setting::", curNode, offsetN, Editor.cursorStart, cursor);
                range.setStart(curNode, offsetN);
                range.setEnd(curNode, offsetN);
                sel.removeAllRanges();
                sel.addRange(range);
            }
            Editor.cursorStart = false;
        }
        return;
    }
    //under development
    //1. needs to reuse the cursorObj before
    //2. needs to implement it when anchorNode offset != focusNode offset
    //    2 scenario : 1 anchorNode and focus Node are within a same header element
    //                 2 anchor and focus are in difference header elements.
    // next step:
    //          debug firefoxEnter with undo/redo 
    //          and backSpacing(need triage and improvement).
    // CURRENT BUGS:
    //          SELECT ALL AND PRESS SHIFT TO SELECT PART OF THE ARTICLE.
    //          CURSOR SAVING NEEDS IMPROVEMENT.
    //          UNDO SAVED CURSOR ERRORS NEEDS FIXING (PROBABLY CAUSED BY CURSOR SAVING ISSUE).

    deleteAllChildrenExceptTheFirst(sel, range) {
        while (this.children.length > 1) {
            this.removeChild(this.lastElementChild);
        }
        this.firstElementChild.innerHTML = "<br>";
        range.setStart(this.firstElementChild, 0);
        range.setEnd(this.firstElementChild, 0);
        sel.removeAllRanges();
        sel.addRange(range);
        return;
    }

    //selected all needs debug
    //
    // 1. new bugs: press enter multiple times will cause the text to disappear.(fix proposed needs tests)
    //
    // 2. new bugs: select all text and press enter then press 
    //          backspace will end up delete the last div in article
    // 3. new bug: first div has issue deleting when user press backSpace.
    //          try to get the first div fixed in place.
    // 4. new bug: double click a paragraph div element and press any letter key will delete the element
    // potential solution: ondclick event handler
    // 5. new bug: deleting the first element when there are more than one element in editor will cause overflow
    // 6. *new bugs: when cursor is placed at the back of a block and press Shift arrowup and type some letter
    //           it will appear at the line above this line. Repeat this operation and delete the first block
    //           and you get letters out of border.
    //           
    //
    getMesg(first, last, keyV) {
        let lmsg = [];
        let rmsg = [];

        for (let i = 0; i < first.firstNodeOffset; i++) {
            lmsg.push(first.firstParaDiv.childNodes[i]);

        }
        let msg = "";
        if (first.firstTextOffset > 0 && first.firstNodeOffset < first.firstParaDiv.childNodes.length) {
            msg = (first.firstParaDiv.childNodes[first.firstNodeOffset].textContent.slice(0, first.firstTextOffset));

        }
        if (keyV && keyV !== "Backspace") {
            msg += keyV;
        }
        if (msg.length) {
            let t = document.createTextNode(msg);
            lmsg.push(t);
        }

        if (last.lastTextOffset >= 0 && last.lastNodeOffset < last.lastParaDiv.childNodes.length
            && last.lastTextOffset < last.lastParaDiv.childNodes[last.lastNodeOffset].textContent.length) {
            let t_ = document.createTextNode(last.lastParaDiv.childNodes[last.lastNodeOffset].textContent.slice(last.lastTextOffset));
            rmsg.push(t_);
        }

        for (let i = (last.lastTextOffset >= 0) ? (last.lastNodeOffset + 1) : (last.lastNodeOffset); i < last.lastParaDiv.childNodes.length; i++) {
            rmsg.push(last.lastParaDiv.childNodes[i]);

        }
        if (rmsg.length && rmsg[0].nodeName == "BR") {
            rmsg.shift();
        }
        console.log(lmsg, rmsg)
        return { leftMsg: lmsg, rightMsg: rmsg };
    }

    fireFoxEnter(event, key) {
        if (!Editor.browser.includes("firefox") || key !== "Enter"
            || Editor.keyHistory["Shift"] == "Down") {
            return;
        }

        let sel = getSelection();
        let range = sel.getRangeAt(0);

        let cursorObj = getCursorInforF(this, Editor);
        //get start and end node of current selection:
        // this can be summarized as a function.
        //start and end node offset and textOffset (if it is a node, textOffset is 0)

        let newP = document.createElement("header-element");
        newP.setAttribute("id", "para");
        newP.setAttribute("name", "initialHeader");
        newP.setAttribute("class", "articleHeader");
        newP.innerHTML = "";
        if (Editor.selectedAll) {

            this.deleteAllChildrenExceptTheFirst(sel, range);
            //return;
            newP.innerHTML = "<br>";
            this.insertBefore(newP, this.lastChild);
            range.setStart(this.lastElementChild, 0);
            range.setEnd(this.lastElementChild, 0);

            return;

        }

        let { first, last } = extractCursorObjF(cursorObj);
        //console.log("offset:", startNodeOffset, startTextOffset);

        if (first.firstParaDiv !== last.lastParaDiv) {
            //console.log("startNode:", startNode, "endNode:", endNode);
            while (first.firstParaDiv.nextElementSibling !== last.lastParaDiv) {

                this.removeChild(first.firstParaDiv.nextElementSibling);
            }
        }

        // get the message on the left and right side of the current cursor.
        // this can be returned as a result of a function

        let { leftMsg, rightMsg } = this.getMesg(first, last, null);
        console.log(leftMsg, rightMsg)
        /* for (let i = 0; i < first.firstNodeOffset; i++) {
            leftMsg.push(first.firstParaDiv.childNodes[i]);

        }
        if (first.firstTextOffset > 0) {
            let t = document.createTextNode(first.firstParaDiv.childNodes[first.firstNodeOffset].textContent.slice(0, first.firstTextOffset));
            leftMsg.push(t);
        }

        if (last.lastTextOffset >= 0 && last.lastTextOffset < last.lastParaDiv.childNodes[last.lastNodeOffset].textContent.length) {
            let t_ = document.createTextNode(last.lastParaDiv.childNodes[last.lastNodeOffset].textContent.slice(last.lastTextOffset));
            rightMsg.push(t_);
        }

        for (let i = (last.lastTextOffset >= 0) ? (last.lastNodeOffset + 1) : (last.lastNodeOffset); i < last.lastParaDiv.childNodes.length; i++) {
            rightMsg.push(last.lastParaDiv.childNodes[i]);

        }
        if (rightMsg.length && rightMsg[0].nodeName == "BR") {
            rightMsg.shift();
        } */

        //console.log("right:", endNodeOffset, endNode.childNodes, rightMsg);

        ///////push left and right message into the start and end nodes
        console.log("left:", leftMsg);
        if (leftMsg.length) {

            while (first.firstParaDiv.childNodes.length) {
                first.firstParaDiv.removeChild(first.firstParaDiv.lastChild);
            }
            for (let m of leftMsg) {
                first.firstParaDiv.appendChild(m);
            }
            if (first.firstParaDiv.lastChild.nodeName !== "BR"
                && first.firstParaDiv === last.lastParaDiv
            ) {
                let brNode = document.createElement("br");
                first.firstParaDiv.appendChild(brNode);
            }
        } else {
            first.firstParaDiv.innerHTML = "<br>";
        }
        //console.log(rightMsg.length)
        if (first.firstParaDiv !== last.lastParaDiv) {
            newP.innerHTML = "<br>";
            if (rightMsg.length) {

                while (last.lastParaDiv.childNodes.length) {
                    last.lastParaDiv.removeChild(last.lastParaDiv.lastChild);
                }
                for (let m of rightMsg) {
                    last.lastParaDiv.appendChild(m);
                }
                let brNode = document.createElement("br");
                first.firstParaDiv.appendChild(brNode);
            } else {
                last.lastParaDiv.innerHTML = "<br>";
            }
        } else {
            if (rightMsg.length) {

                for (let m of rightMsg) {
                    newP.appendChild(m);
                }
            } else {
                newP.innerHTML = "<br>";
            }
        }
        this.insertBefore(newP, first.firstParaDiv.nextSibling);
        range.setStart(newP, 0);
        range.setEnd(newP, 0);

        ////////////////////////////////////////////////////////
        //// adjust viewport position:  /////////////////////
        ///////////////////////////////////////////////////
        let lines = 0;
        for (let c of this.children) {
            for (let n of c.childNodes) {
                if (n.nodeName === "BR") {
                    lines += 1;
                }
            }
        }
        let height = 0;
        /* for (let i = 0; i < firstOuterIndex; i++) {
            for (let n of this.childNodes[i].childNodes) {
                if (n.nodeName === "BR") {
                    lines += 1;
                }
            }
        } */
        let firstOuterIndex = Array.from(this.childNodes).indexOf(first.firstParaDiv);
        //console.log("first out index", firstOuterIndex);
        let nBR = 0;
        let brTotal = 0;
        for (let i = 0; i < this.childNodes[firstOuterIndex].childNodes.length; i++) {
            /* if (i < firstNodeIndex) {
                if (this.childNodes[firstOuterIndex].childNodes[i].nodeName === "BR") {
                    nBR += 1;
                }
            } */
            if (this.childNodes[firstOuterIndex].childNodes[i].nodeName === "BR") {
                brTotal += 1;
            }
        }
        let line_height = this.childNodes[firstOuterIndex].clientHeight / brTotal * nBR;

        for (let i = 0; i <= firstOuterIndex; i++) {
            if (this.childNodes[i].nodeName === "HEADER-ELEMENT") {
                height += this.childNodes[i].clientHeight;
            }
        }
        //console.log(line_height, height);
        //height = height + (line_height);
        //console.log("enter firefox", height, first.firstParaDiv.getBoundingClientRect(), window.innerHeight);
        if (first.firstParaDiv.getBoundingClientRect().top < 60) {
            window.scroll(0, height);
        }
        if (first.firstParaDiv.getBoundingClientRect().top > window.innerHeight - 100) {
            window.scroll(0, height - window.innerHeight + 150);
        }

    }
    handleKeyUp(event) {

        Editor.keyHistory[`${event.key}`] = "Up";
        if (event.key == 'Enter') {

            function removeSpan() {
                let sel = getSelection();
                //console.log("remove SPAN:", sel, sel.anchorNode.parentNode.nodeName, sel.anchorNode);

                if (sel.anchorNode != null && sel.anchorNode.parentNode.nodeName == "SPAN") {
                    //console.log("remove SPAN: anchor");
                    sel.anchorNode.parentNode.parentNode.innerHTML = sel.anchorNode.parentNode.innerHTML;
                }
                if (sel.focusNode != null && sel.focusNode.parentNode.nodeName == "SPAN") {
                    //console.log("remove SPAN: focus");
                    sel.focusNode.parentNode.parentNode.innerHTML = sel.focusNode.parentNode.innerHTML;
                }
                return;
            }
            removeSpan();
            return;

        }

    }
    fireFoxBackSpace(event, sel, range) {

        console.log("mozilla back")
        if (Editor.browser.includes("firefox")) {
            let cursorObj = getCursorInforF(this, Editor);
            console.log("fire mozilla back")
            let node = cursorObj.cAN;

            let { first, last } = extractCursorObjF(cursorObj);
            if (Editor.selectedAll || determineSelectedAllF(this, Editor)) {
                console.log("selected all and remove all", Editor.selectedAll, determineSelectedAllF(this, Editor));
                event.preventDefault();
                this.deleteAllChildrenExceptTheFirst(sel, range);

            }
            let textNodesCount = 0;
            for (let c of node.childNodes) {
                if (c.nodeName == "#text") {
                    textNodesCount += 1;
                }
            }

            console.log("in back", !(Editor.selectedAll), node === this.firstElementChild, first, last)
            if (!(Editor.selectedAll) && (first.firstTextOffset) <= 0 && (last.lastTextOffset) <= 0
                && node === this.firstElementChild && first.firstNodeOffset == 0 && last.lastNodeOffset == 0
                && last.lastOuterIndex === 1 && first.firstOuterIndex === 1) {

                event.preventDefault();
                console.log("inside !!!!!", textNodesCount < 1 && this.children.length > 1, node, this.children.length, textNodesCount)
                if (textNodesCount < 1 && this.children.length > 1) {

                    this.removeChild(this.firstElementChild);
                    let sel = getSelection();
                    let range = sel.getRangeAt(0);
                    range.setStart(this.firstElementChild, 0);
                    range.setEnd(this.firstElementChild, 0);
                }

            }
            if (first.firstNodeOffset === 0 && last.lastNodeOffset === 0 && last.lastOuterIndex < first.firstOuterIndex && cursorObj.oIF === -2 && cursorObj.oIA === first.firstOuterIndex) {
                /* this.removeChild(cursorObj.cAN);
                range.setEnd(cursorObj.cFN, 0); */
                console.log("condition met!!!", cursorObj.cAN);
            }
        }
    }
    fireFoxGridCheck(editor) {

        for (let c of editor.children) {

            if (c.innerHTML === "") {
                editor.removeChild(c);
            }
        }
        return;
    }

    handleKeyDown(event) {

        let curCursor = getCursorInforF(this, Editor);
        console.log(curCursor);

        if (Editor.browser.includes('firefox') && cursorBugF(curCursor, "keydown", Editor) && !Editor.selectedAll
        ) {
            console.log('out of border');
            event.preventDefault();
            //return;
        }

        //WITH BACKSPACE KEY
        let selectAllV = determineSelectedAllF(this, Editor);
        function letterKeyPressed(key) {
            return Editor.keyHistory[`Control`] != "Down" && key != "CapsLock" && key != "Shift"
                && key != "Tab" && key != "Alt" && key != "ArrowLeft" && key != "ArrowUp"
                && key != "ArrowDown" && key != "ArrowRight" && key != "Enter" && key != "Meta";
        }

        function isDirectionKey(key) {
            return (key == "ArrowDown" || key == "ArrowUp" || key == "ArrowLeft" || key == "ArrowRight");
        }

        Editor.keyHistory[`${event.key}`] = "Down";
        //console.log("key pressed:", Editor.cursorStart);
        if (event.key == "a" || event.key == "A") {

            if (Editor.keyHistory[`Control`] == "Down") {
                Editor.selectedAll = true;
                Editor.cursorStart = true;
                let node = this.cloneNode(true);
                this.saveState("undo", node);
                this.saveCursor("undo");

                return;
            }
        }
        if (event.key == "Backspace") {
            let sel = getSelection();
            let range = sel.getRangeAt(0);
            this.fireFoxBackSpace(event, sel, range);
            //for IE and Chrome:
            if (!Editor.browser.includes("firefox") && this.children.length == 1 && !(sel.anchorOffset) && !(sel.focusOffset)) {
                event.preventDefault();
            }

        }

        // NEEDS IMPROVEMENTS !!!!

        if (Editor.browser.includes("firefox")) {
            if (letterKeyPressed(event.key) || event.key == "Enter") {
                function checkDoubleClick(event, editor) {
                    for (let c of editor.children) {
                        if (c.doubleClicked) {
                            event.preventDefault();
                            let sel = getSelection();
                            let range = sel.getRangeAt(0);
                            if (event.key !== "Backspace" && event.key !== "Enter") {
                                c.innerHTML = event.key + "<br>";
                                range.setStart(c, 1);
                                range.setEnd(c, 1);
                            } else {
                                c.innerHTML = "<br>";
                                range.setStart(c, 0);
                                range.setEnd(c, 0);
                            }
                        }
                        c.doubleClicked = false;
                    }
                }
                checkDoubleClick(event, this);
                if (event.key == "Enter" && Editor.keyHistory["Shift"] !== "Down" || (Editor.selectedAll || selectAllV) && event.key != "Backspace") {
                    //console.log("triggered!", selectAllV)
                    event.preventDefault();
                    if ((Editor.selectedAll || selectAllV) && event.key !== "Enter") {
                        let sel = getSelection();
                        let range = sel.getRangeAt(0);
                        this.deleteAllChildrenExceptTheFirst(sel, range);
                        let node = document.createTextNode(event.key);
                        this.firstElementChild.insertBefore(node, this.firstElementChild.lastChild);
                        range.setStart(this.firstElementChild, 1);
                        range.setEnd(this.firstElementChild, 1);

                    }
                }

                let node = this.cloneNode(true);
                this.saveState("undo", node);
                this.saveCursor("undo");
                this.clearRedo();

                this.fireFoxEnter(event, event.key);
            }
            // console.log(Editor.keyHistory["Shift"] === "Down" && event.key === "ArrowRight" && Editor.selectedAll);

            //console.log("key pressed");
            if (event.key === "ArrowUp") {
                let cursor = getCursorInforF(this, Editor);
                let { first, last } = extractCursorObjF(cursor);
                if (!cursorBugF(cursor, "arrow Up", Editor)
                    &&
                    first.firstOuterIndex < this.childNodes.length
                    /* || cursor.oIF > this.children.length
                    || cursor.oIA > this.children.length */) {
                    /* console.log('bug', cursor.cAN, cursor); */


                    let height = 0;

                    let nBR = 0;
                    let brTotal = 0;
                    for (let i = 0; i < this.childNodes[first.firstOuterIndex].childNodes.length; i++) {
                        if (i < first.firstNodeOffset) {
                            if (this.childNodes[first.firstOuterIndex].childNodes[i].nodeName === "BR") {
                                nBR += 1;
                            }
                        }
                        if (this.childNodes[first.firstOuterIndex].childNodes[i].nodeName === "BR") {
                            brTotal += 1;
                        }
                    }
                    let line_height = this.childNodes[first.firstOuterIndex].clientHeight / brTotal * nBR;

                    for (let i = 0; i < first.firstOuterIndex; i++) {
                        if (this.childNodes[i].nodeName === "HEADER-ELEMENT") {
                            height += this.childNodes[i].clientHeight;
                        }
                    }
                    //console.log(line_height, height, window.screenTop);
                    height = height + (line_height);
                    //console.log(height);
                    /* let scrollPosition = this.firstElementChild.clientHeight * lines - 40; */
                    //console.log("this.childNodes[firstOuterIndex].getBoundingClientRect().Y < 120", this.childNodes[first.firstOuterIndex].getBoundingClientRect(), this.childNodes[first.firstOuterIndex].getBoundingClientRect().Y < 120)
                    //console.log("proposed cursor position:", this.childNodes[first.firstOuterIndex].getBoundingClientRect().top + line_height)
                    let cursorPosition = this.childNodes[first.firstOuterIndex].getBoundingClientRect().top + line_height;

                    if (cursorPosition < 80) {
                        //console.log("scroll!!!!!")
                        window.scroll(0, height - 40);
                    }

                    /* console.log(this.childNodes, first.firstOuterIndex, this.firstElementChild.clientHeight);
                    console.log("up scroll", this.firstElementChild.clientHeight, this.childNodes[first.firstOuterIndex].getBoundingClientRect(), height); */
                }

            }
            if (Editor.selectedAll) {

                if (event.key == "ArrowRight" || event.key == "ArrowDown") {
                    console.log("prevent");
                    event.preventDefault();

                    let sel = getSelection();
                    let range = sel.getRangeAt(0);
                    range.setStart(this.lastElementChild.lastChild, 0);
                    range.setEnd(this.lastElementChild.lastChild, 0);

                }
                else if (event.key == "ArrowUp" || event.key == "ArrowLeft") {
                    console.log("prevent");
                    event.preventDefault();

                    let sel = getSelection();
                    let range = sel.getRangeAt(0);
                    range.setStart(this.firstElementChild.firstChild, 0);
                    range.setEnd(this.firstElementChild.firstChild, 0);

                }

            }
            if (Editor.keyHistory["Shift"] === "Down") {
            }
        }

        if (event.key == "Z" || event.key == "z") {

            if (Editor.keyHistory[`Control`] == "Down" && Editor.keyHistory['Shift'] != "Down") {
                //undo
                this.undo(event);
                //return;
            }
            if (Editor.keyHistory[`Control`] == "Down" && Editor.keyHistory['Shift'] == "Down") {
                this.redo();
                //return;
            }
        }
        if (event.key == "Enter") {
            //console.log("here enter");
            let sel = getSelection();
            let range = sel.getRangeAt(0);
        }

        //upset selectedAll if a function key is pressed. IMPORTANT!
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //needs a function for this whole code snipet (trim empty blocks in editor)  /////////////////////////////////////
        //This function is meant to fix firefox browser compatibility issues.   /////////////////////////////////////
        //Should be excluded in microsoft edge and google chrome               /////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        if (Editor.browser.includes('firefox')) {
            //need a function for this session (get last cursor information)

            let cursor = getCursorInforF(this, Editor);

            let { first, last } = extractCursorObjF(cursor);
            /* console.log("debug:", first, last, last.lastParaDiv, last.lastNodeOffset) */
            //console.log("last cursor:", textIndex, nodeIndex, lastCursorNode.childNodes, textIndex < 0 && nodeIndex == lastCursorNode.childNodes.length - 1);
            ///////////////////////////////////////////////////////////
            ///////////////////////////////////////////////////////////
            // FIRST DIV SELECTION ISSUE FIX PROPOSAL//////////////////
            ////////////////////////////////////////////////////////////////
            ///////////////////////////////////////////////////////////
            if (cursor.cAN === cursor.cFN && cursor.cAN === this.firstElementChild
                && (cursor.aIA !== cursor.aIF || cursor.oA !== cursor.oF) && Editor.cursorStart
                && !selectAllV && !Editor.selectedAll && !isDirectionKey(event.key)
            ) {
                let msgRemaining = [];
                event.preventDefault();
                if (last.lastTextOffset >= 0 && last.lastNodeOffset < this.firstElementChild.childNode) {
                    let mesg = (event.key == "Backspace" ? "" : event.key) + this.firstElementChild.childNodes[last.lastNodeOffset].textContent.slice(last.lastTextOffset);

                    if (mesg.length) {
                        let _ = document.createTextNode(mesg);
                        msgRemaining.push(_);
                    }

                } else {
                    let mesg = event.key == "Backspace" ? "" : event.key;

                    if (mesg.length) {
                        let _ = document.createTextNode(mesg);
                        msgRemaining.push(_);
                    }
                }
                for (let i = (last.lastTextOffset >= 0 ? last.lastNodeOffset + 1 : last.lastNodeOffset); i < this.firstElementChild.childNodes.length; i++) {
                    msgRemaining.push(this.firstElementChild.childNodes[i]);
                    console.log("in loop:", i);
                }
                console.log("message remaining:", msgRemaining, event.key, last.lastTextOffset);
                if (letterKeyPressed(event.key)) {
                    while (this.firstElementChild.childNodes.length) {
                        this.firstElementChild.removeChild(this.firstElementChild.lastChild);
                    }
                    for (let c of msgRemaining) {
                        this.firstElementChild.appendChild(c);
                    }
                    let sel = getSelection();
                    let range = sel.getRangeAt(0);
                    let offsetV = 1;
                    let node = this.firstElementChild.childNodes[0];
                    if (event.key == "Backspace") {
                        offsetV = 0;
                        node = this.firstElementChild;
                    }
                    range.setStart(node, offsetV);
                    range.setEnd(node, offsetV);
                }
            }
            ///////////////////////////////////////////////////////////
            ///////////////////////////////////////////////////////////
            // MULTIPLE DIVS SELECTED. BEGIN FROM THE VERY FIRST ELEMENT WITH OFFSET 0 AND ENDS WITH 
            // ANY DIV OTHER THAN THE FIRST ONE AND OFFSET IS THE END OF THE CURRENT DIV CONTAINER.
            ////////////////////////////////////////////////////////////////
            ///////////////////////////////////////////////////////////

            else if ((last.lastTextOffset >= 0 && last.lastNodeOffset < last.lastParaDiv.childNodes.length &&
                last.lastTextOffset == last.lastParaDiv.childNodes[last.lastNodeOffset].textContent.length
                && last.lastNodeOffset == last.lastParaDiv.childNodes.length - 2
                || last.lastTextOffset < 0 && last.lastNodeOffset == last.lastParaDiv.childNodes.length - 1)
                && (cursor.cAN !== cursor.cFN)
            ) {
                /*  console.log('end!', last.lastParaDiv.children); */

                if (letterKeyPressed(event.key) && event.key !== "Enter") {
                    console.log("new function test!!", Editor.cursorStart)
                    if (Editor.cursorStart) {
                        console.log("new function test")
                        event.preventDefault();
                        let sel = getSelection();
                        let range = sel.getRangeAt(0);
                        while (this.firstElementChild.nextElementSibling !== last.lastParaDiv) {
                            this.removeChild(this.firstElementChild.nextElementSibling);
                        }
                        this.removeChild(last.lastParaDiv);
                        let offSet = 0;
                        if (event.key !== "Backspace") {
                            this.firstElementChild.innerHTML = event.key + "<br>"
                            offSet = 1;
                        } else {
                            this.firstElementChild.innerHTML = "<br>";
                        }

                        range.setStart(this.firstElementChild, offSet);
                        range.setEnd(this.firstElementChild, offSet);
                    } else {
                        console.log("in here!!!!!!")
                        event.preventDefault();
                        while (first.firstParaDiv.nextElementSibling !== last.lastParaDiv) {
                            this.removeChild(first.firstParaDiv.nextElementSibling);
                        }
                        this.removeChild(last.lastParaDiv);
                        let { leftMsg, rightMsg } = this.getMesg(first, last, event.key);

                        let brEle = document.createElement("br");

                        while (first.firstParaDiv.childNodes.length) {
                            first.firstParaDiv.removeChild(first.firstParaDiv.lastChild);
                        }
                        for (let c of leftMsg) {
                            first.firstParaDiv.appendChild(c);
                        }

                        first.firstParaDiv.appendChild(brEle);
                        let sel = getSelection();
                        let range = sel.getRangeAt(0);
                        range.setStart(brEle, 0);
                        range.setEnd(brEle, 0);
                    }
                }

            }

        }
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        if (letterKeyPressed(event.key)) {
            Editor.cursorStart = false;
        }
        if (isDirectionKey(event.key) && Editor.keyHistory["Shift"] !== "Down") {
            //console.log("direction key pressed", Editor.keyHistory["Shift"]);
            Editor.cursorStart = false;
        }
        if (event.key != "Shift" && event.key != "Control" && event.key != "CapsLock") {
            Editor.selectedAll = false;
        }
    }
}

class header3 extends HTMLElement {
    constructor() {
        super();
        this.doubleClicked = false;
        this.addEventListener("dragstart", (event) => {

            console.log('drag', event);
            event.preventDefault();
        })
    }
    connectedCallback() {

        this.addEventListener("click", (event) => {
            console.log("clicked")
            for (let c of this.parentNode.children) {
                c.doubleClicked = false;
            }

        })

        this.addEventListener("dblclick", (event) => {

            let cursor = getCursorInforF(this.parentNode, Editor);

            if (Editor.browser.includes("firefox")) {
                if (cursorBugF(cursor, "doubleClick", Editor)) {
                    this.doubleClicked = true;

                }
            }
        })

    }
}
class paragraph extends HTMLElement {
    constructor() {
        super();
    }
}
/////  customized html elements definitions:
let customElementRegistry = window.customElements;
customElementRegistry.define("custom-editor", Editor);
customElementRegistry.define("header-element", header3);
customElementRegistry.define("paragraph-element", paragraph);
customElementRegistry.define("custom-nav", navigatorBar);
