
export class cursor {
    constructor() {

    }

    determineAnchorFocusSequence() {

    }
    alignFirstCursor() {

    }
    alignLastCursor() {

    }

}
///////////////////////////cursor functions://///////////////////

////////////////////////////////////////////////////////////////////////////////////
// function determine whether the anchor or the focus is at the front   ////////
// when text editor undo changes                                        ////////
///////////////////////////////////////////////////////////////////////////////////
export function getCursorInforF(editorObj, Editor) {
    let sel = getSelection();
    console.log("info:", sel);
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

    if (Editor.cursorStart) {

        outerIndexA = 1;
        ancestorIndxA = 0;
        offsetAnchor = 0;
    }
    if (Editor.selectedAll) {
        ancestorAnchorType = "HEADER-ELEMENTS";
        ancestorFocusType = "HEADER-ELEMENTS";
        /////
        outerIndexA = 1;
        ancestorIndxA = 0;
        offsetAnchor = 0;
        curAnchorNode = editorObj.firstElementChild;
        ////
        outerIndexF = editorObj.children.length;
        ancestorIndxF =
            editorObj.lastElementChild.childNodes.length > 1 && editorObj.lastElementChild.lastChild.nodeName == "BR" ?
                editorObj.lastElementChild.childNodes.length - 2 : editorObj.lastElementChild.childNodes.length - 1;
        offsetFocus = editorObj.lastElementChild.childNodes[ancestorIndxF].nodeName == "BR" ?
            0 : editorObj.lastElementChild.childNodes[ancestorIndxF].textContent.length;
        curFocusNode = editorObj.lastElementChild;
    }
    return {
        aT: ancestorAnchorType, oIA: outerIndexA,
        aIA: ancestorIndxA, oA: offsetAnchor,
        fT: ancestorFocusType, oIF: outerIndexF,
        aIF: ancestorIndxF, oF: offsetFocus,
        cAN: curAnchorNode, cFN: curFocusNode,
    };
}
export function determineAnchorFocusSequenceF(cur) {
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
export function setCursorObjF(cursorObj, at, oia, aia, oa, ft, oif, aif, of, can, cfn) {

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
export function alignFirstCursorF(firstCursor, editorObj) {

    //console.log("cursor infor:", firstCursor.firstParaDiv, firstCursor.firstNodeOffset, firstCursor.firstTextOffset);
    return firstCursor.firstParaDiv == editorObj.firstElementChild && !firstCursor.firstNodeOffset && (firstCursor.firstTextOffset <= 0);

}
export function alignLastCursorF(lastCursor, editorObj) {

    let childList = editorObj.lastElementChild.childNodes;
    let textIndex = childList.length - 1;
    //console.log("align:", childList, textIndex);
    while (textIndex && textIndex < childList.length && childList[textIndex].nodeName !== "#text") {
        textIndex--;
    }
    if (childList.length == 1) {
        textIndex = -1;
    }

    return (lastCursor.lastParaDiv == editorObj.lastElementChild &&
        (lastCursor.lastNodeOffset > textIndex && lastCursor.lastNodeOffset == lastCursor.lastParaDiv.childNodes.length - 1
            || textIndex == lastCursor.lastParaDiv.childNodes.length - 2 && lastCursor.lastNodeOffset == textIndex
            && lastCursor.lastTextOffset == lastCursor.lastParaDiv.childNodes[textIndex].length
            || textIndex < 0));
}
export function extractCursorObjF(lastCursorState) {
    //console.log("exract:", lastCursorState);
    let f = determineAnchorFocusSequenceF(lastCursorState);
    let outerIndexA = lastCursorState.oIA < 0 ? lastCursorState.aIA : lastCursorState.oIA;
    let outerIndexF = lastCursorState.oIF < 0 ? lastCursorState.aIF : lastCursorState.oIF;

    let atextOffset = lastCursorState.oIA < 0 ? -1 : lastCursorState.oA;
    let anodeOffset = lastCursorState.oIA < 0 ? lastCursorState.oA : lastCursorState.aIA;

    let ftextOffset = lastCursorState.oIF < 0 ? -1 : lastCursorState.oF;
    let fnodeOffset = lastCursorState.oIF < 0 ? lastCursorState.oF : lastCursorState.aIF;

    let lastParaDiv = lastCursorState.cFN
    let firstParaDiv = lastCursorState.cAN

    let firstOuterIndex = outerIndexA;
    let lastOuterIndex = outerIndexF;
    let firstNodeOffset = anodeOffset;
    let lastNodeOffset = fnodeOffset;
    let firstTextOffset = atextOffset;
    let lastTextOffset = ftextOffset;
    if (!f) {
        lastParaDiv = lastCursorState.cAN;
        firstParaDiv = lastCursorState.cFN;
        firstOuterIndex = outerIndexF;
        lastOuterIndex = outerIndexA;
        firstNodeOffset = fnodeOffset;
        lastNodeOffset = anodeOffset;
        firstTextOffset = ftextOffset;
        lastTextOffset = atextOffset;
    }
    return {
        first: { firstParaDiv, firstOuterIndex, firstNodeOffset, firstTextOffset },
        last: { lastParaDiv, lastOuterIndex, lastNodeOffset, lastTextOffset }
    }
}
export function determineSelectedAllF(editorObj, Editor) {
    let lastCursorState = getCursorInforF(editorObj, Editor);
    let { first, last } = extractCursorObjF(lastCursorState);

    return alignFirstCursorF(first, editorObj)
        && alignLastCursorF(last, editorObj);

}
export function cursorBugF(curCursor, debugStr, Editor) {
    //console.log("cursor in another file", debugStr, Editor.selectedAll);
    let nodeOffset = curCursor.oIA < 0 ? curCursor.oA : curCursor.aIA;
    let textOffset = curCursor.oIA < 0 ? -1 : curCursor.oA;
    //console.log("node offset in cursor bug:", "from", debugStr, curCursor.cAN.childNodes, nodeOffset);
    if (nodeOffset >= curCursor.cAN.childNodes.length ||
        nodeOffset < curCursor.cAN.childNodes.length && textOffset > curCursor.cAN.childNodes[nodeOffset].length
        || curCursor.aT == "HEADER-ELEMENT" && curCursor.cAN.childNodes[nodeOffset].nodeName !== "#text" && textOffset > 0

    ) {
        return true;
    }

    nodeOffset = curCursor.oIF < 0 ? curCursor.oF : curCursor.aIF;
    textOffset = curCursor.oIF < 0 ? -1 : curCursor.oF;

    //console.log("node offset in cursor bug:", curCursor, curCursor.cFN.childNodes, nodeOffset, textOffset, nodeOffset >= curCursor.cFN.childNodes.length, curCursor.fT == "HEADER-ELEMENT", curCursor.cFN.childNodes[nodeOffset].nodeName !== "#text" && textOffset > 0);
    if (nodeOffset >= curCursor.cFN.childNodes.length ||
        nodeOffset < curCursor.cFN.childNodes.length && textOffset > curCursor.cFN.childNodes[nodeOffset].length
        || curCursor.fT == "HEADER-ELEMENT" && curCursor.cFN.childNodes[nodeOffset].nodeName !== "#text" && textOffset > 0
    ) {

        return true;
    }
    //console.log("pass")
    return false;
}
export function setCursorInText(cursor, editorObj, Editor) {

    let range = getSelection().getRangeAt(0);
    var containerA = editorObj;
    var containerF = editorObj;
    //console.log(editorObj.children, editorObj.childNodes, "in set cursor");
    if (cursor.aT == "HEADER-ELEMENT") {
        containerA = containerA.childNodes[cursor.oIA];
        if (!containerA) {
            cursor.oIA = editorObj.childNodes.length - 2;
            containerA = containerA.childNodes[cursor.oIA];
            cursor.aIA = containerA.lastElementChild.childNodes.length - 1;
            cursor.oA = containerA.lastElementChild.lastElementChild.nodeName == "BR" ?
                0 : containerA.lastElementChild.lastElementChild.textContent.length;
        }


    }
    if (cursor.fT == "HEADER-ELEMENT") {
        containerF = cursor.oIF >= containerF.childNodes.length ?
            containerF.lastElementChild : containerF.childNodes[cursor.oIF];
        if (!containerF) {
            cursor.oIF = editorObj.childNodes.length - 2;
            containerF = containerF.childNodes[cursor.oIF];
            cursor.aIF = containerF.lastElementChild.childNodes.length - 1;
            cursor.oF = containerF.lastElementChild.lastElementChild.nodeName == "BR" ?
                0 : containerF.lastElementChild.lastElementChild.textContent.length;
        }
    }

    if (cursor.oIA == 1 && cursor.aIA == 0 && cursor.oA == 0) {
        Editor.cursorStart = true;
    } else {
        Editor.cursorStart = false;
    }
    let f = determineAnchorFocusSequenceF(cursor);

    if (f) {
        range.setStart(containerA.childNodes[cursor.aIA], cursor.oA);
        range.setEnd(containerF.childNodes[cursor.aIF], cursor.oF);
    } else {
        range.setEnd(containerA.childNodes[cursor.aIA], cursor.oA);
        range.setStart(containerF.childNodes[cursor.aIF], cursor.oF);
    }
    return;
}
