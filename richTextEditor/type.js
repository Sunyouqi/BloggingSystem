
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
class newDiv {
    constructor() {
        console.log("construct new div element");
    }
}
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
        //let head = new header3();
        /* this.divList = [];
        //console.log(head);
        this.divList.push(new newDiv());
        console.log(this.divList) */

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

        this.focus();


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
    getCursorInfor() {
        let sel = getSelection();


        let curAnchorNode = sel.anchorNode;

        if (curAnchorNode.nodeName == "HEADER-ELEMENT") {
            curAnchorNode = sel.anchorNode;
        } else if (curAnchorNode.nodeName == "#text" || curAnchorNode.nodeName == "BR") {
            curAnchorNode = curAnchorNode.parentNode;
        }

        let curFocusNode = sel.focusNode;
        if (curFocusNode.nodeName == "HEADER-ELEMENT") {
            curFocusNode = sel.focusNode;
        } else if (curFocusNode.nodeName == "#text" || curFocusNode.nodeName == "BR") {
            curFocusNode = curFocusNode.parentNode;
        }
        //console.log("curFocusNode:", curFocusNode, sel);
        let ancestorAnchorType = sel.anchorNode.parentNode.nodeName;
        let ancestorAnchor = sel.anchorNode.parentNode;
        let ancestorFocusType = sel.focusNode.parentNode.nodeName;
        let ancestorFocus = sel.focusNode.parentNode;
        var outerIndexA = -2;
        var outerIndexF = -2;
        if (curAnchorNode.nodeName == "CUSTOM-EDITOR") {
            curAnchorNode = curAnchorNode.firstElementChild;
            ancestorAnchorType = "HEADER-ELEMENT";
        }
        if (curFocusNode.nodeName == "CUSTOM-EDITOR") {

            curFocusNode = curFocusNode.firstElementChild;
            ancestorFocusType = "HEADER-ELEMENT";
        }

        if (ancestorAnchorType == "HEADER-ELEMENT") {

            outerIndexA = Array(...sel.anchorNode.parentNode.parentNode.childNodes).indexOf(sel.anchorNode.parentNode);
        }
        if (ancestorFocusType == "HEADER-ELEMENT") {
            outerIndexF = Array(...sel.focusNode.parentNode.parentNode.childNodes).indexOf(sel.focusNode.parentNode);
        }

        let ancestorIndxA = Array(...sel.anchorNode.parentNode.childNodes).indexOf(sel.anchorNode);
        let ancestorIndxF = Array(...sel.focusNode.parentNode.childNodes).indexOf(sel.focusNode);
        let offsetAnchor = sel.anchorOffset;
        let offsetFocus = sel.focusOffset;
        //console.log("selected ALL start from beginning", Editor.cursorStart)
        if (Editor.cursorStart) {
            //console.log("selected ALL start from beginning!!")
            outerIndexA = 1;
            ancestorIndxA = 0;
            offsetAnchor = 0;
        }
        return {
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
        };
    }

    setCursorObj(cursorObj, at, oia, aia, oa, ft, oif, aif, of, can, cfn) {

        cursorObj.aT = at;
        cursorObj.oIA = oia;
        cursorObj.aIA = aia;
        cursorObj.oA = oa;
        cursorObj.fT = ft;
        cursorObj.oIF = oif;
        cursorObj.aIF = aif;
        cursorObj.oF = of;
        cursorObj.cAN = can;
        cursorObj.cFN = cfn;
        return;
    }

    saveCursor(action) {


        let cursorObj = this.getCursorInfor();
        //console.log("in save cursor:", curFocusNode.children, offsetFocus);
        /* console.log("in save node:", cursorObj.cFN, cursorObj.cAN,
            this.children.length, this.children[this.children.length - 1].childNodes
        ); */

        if (Editor.selectedAll && Editor.browser.includes("firefox")) {
            /*  console.log("selected all!!!!!!", this.children, this.lastElementChild, Editor.undoNodes[Editor.undoNodes.length - 1]);
             console.log("last state:", Editor.undoNodes[Editor.undoNodes.length - 1].firstElementChild.childNodes,
                 Editor.undoNodes[Editor.undoNodes.length - 1].lastElementChild.childNodes
             ) */

            let lastState = this.getLatestUndoState();
            //console.log("in save cursor last state:", lastState, lastState.lastElementChild.lastChild.previousSibling);
            this.setCursorObj(cursorObj, "HEADER-ELEMENT", 1, 0, 0, "HEADER-ELEMENT", lastState.children.length,
                lastState.lastElementChild.childNodes.length - 1,
                0,
                lastState.firstElementChild,
                lastState.lastElementChild
            );
        }
        if (action == "undo") {
            Editor.undoCursorQueue.push(cursorObj);
            //console.log("queue undo:", Editor.undoCursorQueue);
        } else {
            Editor.redoCursorQueue.push(cursorObj);

        }
        //console.log("selected all save", action, cursorObj, Editor.undoCursorQueue);
        return;
    }
    ////////////////////////////////////////////////////////////////////////////////////
    // function determine whether the anchor or the focus is at the front   ////////
    // when text editor undo changes                                        ////////
    ///////////////////////////////////////////////////////////////////////////////////
    determineAnchorFocusSequence(cur) {
        let first = 0;

        if (cur.oIA >= 0 && cur.oIF >= 0) {
            if (cur.oIA < cur.oIF) {

                first = 1;
            } else if (cur.oIA > cur.oIF) {

                first = 0;
            } else {

                if (cur.aIA < cur.aIF) {
                    first = 1;
                } else if (cur.aIA > cur.aIF) {
                    first = 0;
                } else {
                    if (cur.oA < cur.oF) {
                        first = 1;
                    } else {
                        first = 0;
                    }
                }
            }
        } else if (cur.oIA < 0 && cur.oIF > 0) {
            if (cur.aIA < cur.oIF) {
                first = 1;
            } else if (cur.aIA > cur.oIF) {
                first = 0;
            } else {
                if (cur.oA < cur.aIF) {
                    first = 1;
                } else {
                    first = 0;
                }
            }
        } else if (cur.oIA > 0 && cur.oIF < 0) {
            if (cur.oIA < cur.aIF) {
                first = 1;
            } else if (cur.oIA > cur.aIF) {
                first = 0;
            } else {
                if (cur.aIA < cur.oF) {
                    first = 1;
                } else {
                    first = 0;
                }
            }
        } else {
            if (cur.aIA < cur.aIF) {
                first = 1;
            } else if (cur.aIA > cur.aIF) {
                first = 0;
            } else {
                if (cur.oA < cur.oF) {
                    first = 1;
                } else {
                    first = 0;
                }
            }
        }

        return first;

    }
    ////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////
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
        let f = this.determineAnchorFocusSequence(cur);
        //console.log("restoring:", containerA, containerF, this, cur);

        if (f) {
            range.setStart(containerA.childNodes[cur.aIA], cur.oA);
            range.setEnd(containerF.childNodes[cur.aIF], cur.oF);
            /* sel.removeAllRanges();
            sel.addRange(range);
    */
        } else {
            range.setEnd(containerA.childNodes[cur.aIA], cur.oA);
            range.setStart(containerF.childNodes[cur.aIF], cur.oF);
            /* sel.removeAllRanges();
            sel.addRange(range); */
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
    alignFirstCursor(firstCursor) {

        //console.log("cursor infor:", firstCursor.firstParaDiv, firstCursor.firstNodeOffset, firstCursor.firstTextOffset);
        return firstCursor.firstParaDiv == this.firstElementChild && !firstCursor.firstNodeOffset && (firstCursor.firstTextOffset <= 0);

    }
    alignLastCursor(lastCursor) {

        let childList = this.lastElementChild.childNodes;
        let textIndex = childList.length - 1;

        while (childList[textIndex].nodeName !== "#text" && textIndex) {
            textIndex--;
        }
        if (childList.length == 1) {
            textIndex = -1;
        }
        //console.log("last cursor info:", lastCursor.lastParaDiv, lastCursor.lastNodeOffset, lastCursor.lastTextOffset);
        //console.log(/* lastCursor.lastParaDiv == this.lastElementChild && */textIndex, lastCursor.lastNodeOffset,
        //lastCursor.lastNodeOffset > textIndex /* && lastCursor.lastNodeOffset == lastCursor.lastParaDiv.childNodes.length - 1 */);
        return (lastCursor.lastParaDiv == this.lastElementChild &&
            (lastCursor.lastNodeOffset > textIndex && lastCursor.lastNodeOffset == lastCursor.lastParaDiv.childNodes.length - 1
                || textIndex == lastCursor.lastParaDiv.childNodes.length - 2 && lastCursor.lastNodeOffset == textIndex
                && lastCursor.lastTextOffset == lastCursor.lastParaDiv.childNodes[textIndex].length
                || textIndex < 0));
    }
    extractCursorObj(lastCursorState) {
        //console.log("exract:", lastCursorState);
        let f = this.determineAnchorFocusSequence(lastCursorState);

        let atextOffset = lastCursorState.oIA < 0 ? -1 : lastCursorState.oA;
        let anodeOffset = lastCursorState.oIA < 0 ? lastCursorState.oA : lastCursorState.aIA;

        let ftextOffset = lastCursorState.oIF < 0 ? -1 : lastCursorState.oF;
        let fnodeOffset = lastCursorState.oIF < 0 ? lastCursorState.oF : lastCursorState.aIF;

        let lastParaDiv = lastCursorState.cFN
        let firstParaDiv = lastCursorState.cAN

        let firstNodeOffset = anodeOffset;
        let lastNodeOffset = fnodeOffset;
        let firstTextOffset = atextOffset;
        let lastTextOffset = ftextOffset;
        if (!f) {
            lastParaDiv = lastCursorState.cAN
            firstParaDiv = lastCursorState.cFN
            firstNodeOffset = fnodeOffset;
            lastNodeOffset = anodeOffset;
            firstTextOffset = ftextOffset;
            lastTextOffset = atextOffset;
        }
        return {
            first: { firstParaDiv, firstNodeOffset, firstTextOffset },
            last: { lastParaDiv, lastNodeOffset, lastTextOffset }
        }
    }
    determineSelectedAll() {
        let lastCursorState = this.getCursorInfor();
        let { first, last } = this.extractCursorObj(lastCursorState);

        return this.alignFirstCursor(first)
            && this.alignLastCursor(last);

    }
    handleClick(event) {

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
        //console.log("clicked", this.getLatestUndoCursor(), Editor.undoCursorQueue);
        //let focusOffsetV = this.getLatestUndoCursor().oIF < 0 ? this.getLatestUndoCursor().oF : this.getLatestUndoCursor().aIF;
        /* console.log("compare to", this.lastElementChild,
            this.lastElementChild.lastElementChild
            , Array.from(this.lastElementChild.childNodes).indexOf(this.lastElementChild.lastElementChild)
            , lastMsg
            , Array.from(childList).indexOf(lastMsg)
            , "focus offset:", focusOffsetV
            , "lasttext index:", textIndex, childList[textIndex]
            , this.lastElementChild, this.firstElementChild
            , focusOffsetV >= textIndex
            , getSelection(),
            "selected all????", this.determineSelectedAll()

        ); */
        //console.log("selected all????", this.determineSelectedAll());
        // need to handle the situation when alt + a pressed and user hold shift and click
        // the end of the container.
        // still need polishing ...
        if (Editor.selectedAll) {
            //console.log("key history:", Editor.keyHistory);
            let LAST = false;
            if (Editor.keyHistory["Shift"] == "Down") {
                LAST = this.alignLastCursor(this.extractCursorObj(this.getCursorInfor()).last);
                //console.log('last?:', LAST, this.extractCursorObj(this.getLatestUndoCursor()).last);
            }
            if (!LAST) {
                Editor.selectedAll = false;
            }

        }
        console.log(Editor.keyHistory.hasOwnProperty("count"), Editor.keyHistory["count"])
        if (Editor.keyHistory["count"] == 3) {
            Editor.keyHistory["count"] = 1;
            let sel = getSelection();
            let range = sel.getRangeAt(0);
            let cursor = this.getCursorInfor();
            let f = this.determineAnchorFocusSequence(cursor);
            let lastCursorNode = cursor.cFN;
            let nodeIndex = cursor.oIF >= 0 ? cursor.aIF : cursor.oF;
            let textIndex = cursor.oIF >= 0 ? cursor.oF : -1;
            //console.log("cursor:", cursor);
            if (!f) {
                lastCursorNode = cursor.cAN;
                nodeIndex = cursor.oIA >= 0 ? cursor.aIA : cursor.oA;
                textIndex = cursor.oIA >= 0 ? cursor.oA : -1;
            }
            let curNode = textIndex >= 0 ? lastCursorNode.childNodes[nodeIndex] : lastCursorNode;
            let offsetN = textIndex >= 0 ? textIndex : 0;
            range.setStart(curNode, offsetN);
            range.setEnd(curNode, offsetN);
            sel.removeAllRanges();
            sel.addRange(range);
        }

        if (Editor.keyHistory["Shift"] == "Up") {
            let cursor = this.getCursorInfor();
            /* if (cursor.oIA == 3 && cursor.aIA == 1 && cursor.oA == 0 && cursor.cAN === this.firstElementChild) {
                return;
            } */
            console.log("unset cursor start", cursor)
            Editor.cursorStart = false;
        } else {
            if (!Editor.keyHistory.hasOwnProperty("count") || Editor.keyHistory["count"] == 3) {
                Editor.keyHistory["count"] = 1;
            }
            else if (Editor.keyHistory.hasOwnProperty("count") && Editor.cursorStart) {
                Editor.keyHistory["count"] += 1;
            }
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
    //new bugs: press enter multiple times will cause the text to disappear.(fix proposed needs tests)
    //
    //new bugs: select all text and press enter then press 
    //          backspace will end up delete the last div in article
    fireFoxEnter(event, key) {
        if (!Editor.browser.includes("firefox") || key !== "Enter"
            || Editor.keyHistory["Shift"] == "Down") {
            return;
        }
        //console.log("firefox enter")
        //event.preventDefault();
        //console.log("enter!!!", Editor.cursorStart);
        let sel = getSelection();
        let range = sel.getRangeAt(0);

        let cursorObj = this.getCursorInfor();

        let f = this.determineAnchorFocusSequence(cursorObj);

        let curAnchorNode = cursorObj.cAN;
        let curFocusNode = cursorObj.cFN;

        /* console.log(curAnchorNode, curAnchorNode.nodeName, curAnchorNode.nodeName == "HEADER-ELEMENT",
            curFocusNode, curFocusNode.nodeName
        ); */
        //get start and end node of current selection:
        // this can be summarized as a function.
        //start and end node offset and textOffset (if it is a node, textOffset is 0)

        let startNode = curAnchorNode;
        let endNode = curFocusNode;
        if (!f) {
            startNode = curFocusNode;
            endNode = curAnchorNode;
        }
        //console.log("start:", startNode, "end:", endNode, cursorObj);

        let newP = document.createElement("header-element");
        newP.setAttribute("id", "para");
        newP.setAttribute("name", "initialHeader");
        newP.setAttribute("class", "articleHeader");
        newP.innerHTML = "";
        if (Editor.selectedAll) {

            this.deleteAllChildrenExceptTheFirst(sel, range);
            //return;
            newP.innerHTML = "<br>";
            //console.log("startnode:", startNode, startNode.nextSibling);
            console.log(this.lastChild)
            this.insertBefore(newP, this.lastChild);
            range.setStart(this.lastElementChild, 0);
            range.setEnd(this.lastElementChild, 0);
            /* sel.removeAllRanges();
            sel.addRange(range); */
            console.log(this.childNodes)
            return;

        }
        console.log("cursor:", cursorObj)
        //console.log("enter firefox");
        //console.log("enter:", sel.anchorOffset, sel.focusOffset, sel.focusNode,
        //Array(...curAnchorNode.parentNode.childNodes).indexOf(curAnchorNode)
        //);

        let nodeOffset = cursorObj.oIA < 0 ? cursorObj.oA : cursorObj.aIA;
        let textOffset = cursorObj.oIA < 0 ? -1 : cursorObj.oA;

        let fnodeOffset = cursorObj.oIF < 0 ? cursorObj.oF : cursorObj.aIF;
        let ftextOffset = cursorObj.oIF < 0 ? -1 : cursorObj.oF;

        let startNodeOffset = nodeOffset;
        let startTextOffset = textOffset;
        let endNodeOffset = fnodeOffset;
        let endTextOffset = ftextOffset;
        if (!f) {
            startNodeOffset = fnodeOffset;
            startTextOffset = ftextOffset;
            endNodeOffset = nodeOffset;
            endTextOffset = textOffset;
        }
        //console.log("offset:", startNodeOffset, startTextOffset);

        if (startNode !== endNode) {
            //console.log("startNode:", startNode, "endNode:", endNode);
            while (startNode.nextElementSibling !== endNode) {
                //console.log("remove:",     startNode.nextElementSibling, endNode.innerHTML, startNode.nextElementSibling != endNode);
                console.log(startNode.nextElementSibling, startNode)
                this.removeChild(startNode.nextElementSibling);


            }
        }

        // get the message on the left and right side of the current cursor.
        // this can be returned as a result of a function

        let leftMsg = [];
        let rightMsg = [];
        console.log("starrrrrt:::", startNodeOffset, startTextOffset, Editor.cursorStart);
        for (let i = 0; i < startNodeOffset; i++) {
            //console.log(startNodeOffset, startNode.childNodes[i]);
            leftMsg.push(startNode.childNodes[i]);

        }
        if (startTextOffset > 0) {
            let t = document.createTextNode(startNode.childNodes[startNodeOffset].textContent.slice(0, startTextOffset));
            leftMsg.push(t);
        }

        console.log("left:", leftMsg);

        if (endTextOffset >= 0 && endTextOffset < endNode.childNodes[endNodeOffset].textContent.length) {
            let t_ = document.createTextNode(endNode.childNodes[endNodeOffset].textContent.slice(endTextOffset));
            rightMsg.push(t_);
        }
        //console.log("before right msg", rightMsg, endTextOffset)

        for (let i = (endTextOffset >= 0) ? (endNodeOffset + 1) : (endNodeOffset); i < endNode.childNodes.length; i++) {
            rightMsg.push(endNode.childNodes[i]);
            //console.log("right push", endNode.childNodes[i])

        }
        //console.log("right msg", rightMsg)
        if (rightMsg.length && rightMsg[0].nodeName == "BR") {
            rightMsg.shift();
        }

        console.log("right:", endNodeOffset, endNode.childNodes, rightMsg);

        ///////push left and right message into the start and end nodes

        if (leftMsg.length) {

            while (startNode.childNodes.length) {
                startNode.removeChild(startNode.lastChild);
            }
            for (let m of leftMsg) {
                startNode.appendChild(m);
            }
            let brNode = document.createElement("br");
            startNode.appendChild(brNode);

        } else {
            startNode.innerHTML = "<br>";
        }
        //console.log(rightMsg.length)
        if (startNode !== endNode) {
            newP.innerHTML = "<br>";
            if (rightMsg.length) {

                while (endNode.childNodes.length) {
                    endNode.removeChild(endNode.lastChild);
                }
                for (let m of rightMsg) {
                    endNode.appendChild(m);
                }
                let brNode = document.createElement("br");
                startNode.appendChild(brNode);
            } else {
                endNode.innerHTML = "<br>";
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
        this.insertBefore(newP, startNode.nextSibling);
        range.setStart(newP, 0);
        range.setEnd(newP, 0);

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

        //this.fireFoxGridCheck();

    }
    fireFoxBackSpace(event, sel, range) {

        console.log("mozilla back")
        if (Editor.browser.includes("firefox")) {
            let cursorObj = this.getCursorInfor();
            let state = this.getLatestUndoState();
            let node = cursorObj.cAN;
            let lastNode = cursorObj.cFN;
            let FIndex = cursorObj.oIF > 0 ? cursorObj.oIF : cursorObj.aIF;
            let AIndex = cursorObj.oIA > 0 ? cursorObj.oIA : cursorObj.aIA;
            let offsetAv = cursorObj.oIA > 0 ? cursorObj.aIA : cursorObj.oA;
            let offsetFv = cursorObj.oIF > 0 ? cursorObj.aIF : cursorObj.oF;
            let selectedAllB = 0;
            let idifference = Math.abs(AIndex - FIndex) + 1;

            if (Editor.selectedAll || this.determineSelectedAll()) {
                //console.log("selected all and remove all");
                event.preventDefault();
                this.deleteAllChildrenExceptTheFirst(sel, range);

            }
            let textNodesCount = 0;
            for (let c of node.childNodes) {
                if (c.nodeName == "#text") {
                    textNodesCount += 1;
                }
            }
            if (!(Editor.selectedAll) && !(sel.anchorOffset) && !(sel.focusOffset)
                && node === this.firstElementChild && lastNode !== this.lastElementChild
                && node === lastNode && textNodesCount == 1) {
                console.log("heree213", sel, node, lastNode, textNodesCount);
                event.preventDefault();
            }
            // console.log("node number:", this.childNodes, this.firstElementChild);


        }
    }
    fireFoxGridCheck(editor) {
        //console.log("check:")
        for (let c of editor.children) {
            //console.log(c, c.innerHTML);
            if (c.innerHTML === "") {
                editor.removeChild(c);
            }
        }
        return;
    }
    handleKeyDown(event) {
        function letterKeyPressed(key) {
            return Editor.keyHistory[`Control`] != "Down" && key != "CapsLock" && key != "Shift"
                && key != "Tab" && key != "Alt" && key != "ArrowLeft" && key != "ArrowUp"
                && key != "ArrowDown" && key != "ArrowRight" && key != "Enter" && key != "Meta";
        }
        function alphaNumericKeyOnly(key) {

            return (key >= 'a' && key <= 'z' || key >= 'A' && key <= 'Z' || key >= '0' && key <= '9')
                && Editor.keyHistory[`Control`] != "Down" && key != "CapsLock" && key != "Shift"
                && key != "Tab" && key != "Alt" && key != "ArrowLeft" && key != "ArrowUp"
                && key != "ArrowDown" && key != "ArrowRight" && key != "Enter";
        }
        function isDirectionKey(key) {
            return (key == "ArrowDown" || key == "ArrowUp" || key == "ArrowLeft" || key == "ArrowRight");
        }

        Editor.keyHistory[`${event.key}`] = "Down";
        //console.log("key pressed:", getSelection(), this.getLatestUndoCursor());
        if (event.key == "a" || event.key == "A") {

            if (Editor.keyHistory[`Control`] == "Down") {

                //console.log("select all")
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
            if (!Editor.browser.includes("firefox") && this.children.length == 1 && !(sel.anchorOffset)) {
                //console.log("3");
                event.preventDefault();
            }

        }
        console.log("KEY:", event.key.codePointAt(0), event.key,
            "cursor start:", Editor.cursorStart, "selectedAll:", Editor.selectedAll);
        if (letterKeyPressed(event.key) || event.key == "Enter") {

            //console.log("KEY:", event.key.codePointAt(0), event.key);
            // NEEDS IMPROVEMENTS !!!!
            let selectAllV = this.determineSelectedAll();
            if (Editor.browser.includes("firefox")) {
                if (event.key == "Enter" && Editor.keyHistory["Shift"] !== "Down" || (Editor.selectedAll || selectAllV) && event.key != "Backspace") {
                    console.log("triggered!", selectAllV)
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
            }
            //console.log("key pressed");
            let node = this.cloneNode(true);
            this.saveState("undo", node);
            this.saveCursor("undo");
            this.clearRedo();

            this.fireFoxEnter(event, event.key);
            //return;

            //Editor.cursorStart = false;
        }
        //console.log("outside direction key pressed !", Editor.keyHistory["Shift"]);

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
        if (event.key != "Shift" && event.key != "Control" && event.key != "CapsLock") {
            Editor.selectedAll = false;
        }

        //setTimeout(this.fireFoxGridCheck, 1, this);


        //needs a function for this whole code snipet (trim empty blocks in editor)
        {
            //need a function for this session (get last cursor information)

            let cursor = this.getCursorInfor();
            let f = this.determineAnchorFocusSequence(cursor);
            let lastCursorNode = cursor.cFN;
            let nodeIndex = cursor.oIF >= 0 ? cursor.aIF : cursor.oF;
            let textIndex = cursor.oIF >= 0 ? cursor.oF : -1;
            //console.log("cursor:", cursor);
            if (!f) {
                lastCursorNode = cursor.cAN;
                nodeIndex = cursor.oIA >= 0 ? cursor.aIA : cursor.oA;
                textIndex = cursor.oIA >= 0 ? cursor.oA : -1;
            }

            if ((textIndex >= 0 && textIndex == lastCursorNode.childNodes[nodeIndex].textContent.length
                && nodeIndex == lastCursorNode.childNodes.length - 2
                || textIndex < 0 && nodeIndex == lastCursorNode.childNodes.length - 1)
                && cursor.cAN !== cursor.cFN
            ) {
                console.log('end!', lastCursorNode.children);
                /* lastCursorNode.innerHTML = "<br>" */
                if (letterKeyPressed(event.key)) {
                    console.log("new function test!!", Editor.cursorStart)
                    if (Editor.cursorStart) {
                        console.log("new function test")
                        event.preventDefault();
                        let sel = getSelection();
                        let range = sel.getRangeAt(0);
                        while (this.firstElementChild.nextElementSibling !== lastCursorNode) {
                            this.removeChild(this.firstElementChild.nextElementSibling);
                        }
                        this.removeChild(lastCursorNode);
                        this.firstElementChild.innerHTML = event.key + "<br>";
                        range.setStart(this.firstElementChild, 1);
                        range.setEnd(this.firstElementChild, 1)
                    } else {
                        this.removeChild(lastCursorNode);
                    }
                }

            }
            if (letterKeyPressed(event.key)) {
                Editor.cursorStart = false;
            }
            if (isDirectionKey(event.key) && Editor.keyHistory["Shift"] !== "Down") {
                //console.log("direction key pressed", Editor.keyHistory["Shift"]);
                Editor.cursorStart = false;
            }
        }
    }
}

class header3 extends HTMLElement {
    constructor() {
        super();

    }
    connectedCallback() {
        //console.log("header3");
        /* this.addEventListener("keydown", (event) => {
            console.log("header:", event.key);
        })
        this.addEventListener("click", (event) => {
            console.log("header:", event);
        }) */
        this.addEventListener("keypress", (event) => {
            console.log("header:", event);
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
