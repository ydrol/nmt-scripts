var ssTitleToRef = new Array(); //Map title to multiple jukebox ids.
var ssId2Title = new Array(); // internal array - each title has an internal ss id
var ssWord2Id = new Array();  // map a word to ss id

function supersearch_init(id2title) {

    // Build hash of title to application ids ssTitleToRef
    // Build array of internal title ids ssId2Title 
    var count = 0;
    var ssid = 0;
    for (var i in id2title ) {
        //alert('title='+i);
        var t = id2title[i].toLowerCase();
        addHash(ssTitleToRef,t,i);
    }
    for( var t in ssTitleToRef ) {
        ssId2Title[++count] = t;
        // alert("title["+t+"]="+ssTitleToRef[t]);
    }
    // ------------------
    // ------------------
//    for (var i in ssId2Title ) {
//        alert("index "+ssId2Title[i]);
//        for(var j in ssTitleToRef[ssId2Title[i]] ) {
//            alert("value "+ssTitleToRef[ssId2Title[i]][j]);
//        }
//    }
    // ------------------
    // build word list to ssId2Title
    for( var i in ssId2Title ) {
        var words = ssId2Title[i].split(" ");
        for( var w in words ) {
            var word = words[w];
            addHash(ssWord2Id,word,i);
        }
    }
    // for( var w in ssWord2Id ) { alert("word["+w+"]="+ssWord2Id[w]); }

}

function addHash(arr,index,value) {
    var arr2 = arr[index];
    if (!arr2) {
        arr2 = arr[index] = new Array();
    }
    arr2[arr2.length] = value;
}


var ss_grid_rows;
var ss_grid_cols;
var ss_result_rows;
var ss_grid_prefix;
var ss_results_prefix;

// Map a grid element o
var ss_grid_matches;

function supersearch_display(searchstring,grid_prefix,grid_rows,grid_cols,results_prefix,result_rows) {

    // Set dimensions of grid and results
    ss_grid_cols = grid_cols;
    ss_grid_rows = grid_rows;
    ss_result_rows = result_rows;
    ss_grid_prefix = grid_prefix;
    ss_results_prefix = results_prefix;

    var matches = new Array();

    var results = new Array();

    var lenstr = searchstring.length;

    // Add all of the words that match the search string - index by search string + next letter.
    for (var w in ssWord2Id ) {
        if (w.substr(0,lenstr) == searchstring ) {
            addHash(matches,w.substr(0,lenstr+1),w);
            
            //also store ids of all titles that have word w
            for(var idx in ssWord2Id[w]) {
                var i = ssWord2Id[w][idx];
                results[i] = 1;
            }
        }
    }


    // Put the matches into the grid
    ss_display_matches(matches,grid_rows,grid_cols,searchstring);

    ss_display_results(results);
}

function ss_display_results(results) {
    
    var sorted_titles = new Array();
    var j = 0;

    for( var i in results ) {
        sorted_titles[j++] = ssId2Title[i];
    }
    if (j > ss_result_rows) {
        set_result(0,"Too many results");
    } else {
        sorted_titles.sort();

        // Clear the rest of the values
        for( i = 0  ; i < ss_result_rows ; i++ ) {
            if (sorted_titles[i] ) {
                set_result(i,sorted_titles[i]);
            } else {
                set_result(i,"----------");
            }
        }
    }
}

function ss_display_matches(matches,rows,cols,searchstring) {

    var updated = new Array();

    var sorted_words = new Array();
    var i=0;
    for( var w in matches ) {
        sorted_words[i++] = w;
    }
    sorted_words.sort();

    // update new values 
    var r = 0;
    var c = 0;
    if (matches.length > rows * cols ) alert ("result overflow!");
    for( var w in sorted_words ) {
        var m = matches[sorted_words[w]];

        //Swap the commented lines to see the matches
        //var show = longest_substring(m,searchstring)+":"+searchstring+":"+m;
        var show = longest_substring(m,searchstring);
        set_grid(r,c,show);
        updated[c+r*cols] = 1;
        c++;
        if (c >= cols) {
            c = 0;
            r++;
        }
    }
    // Clear the rest of the grid 
    for(var r = 0 ; r < ss_grid_rows ; r++ ) {
        for(var c = 0 ; c < ss_grid_cols ; c++ ) {
            if (!updated[c+r*cols]) {
                set_grid(r,c,"-");
            }
        }
    }
}

function set_result(i,value) {
    document.getElementById(ss_results_prefix+i).firstChild.nodeValue = value;
}

function set_grid(r,c,value) {
    document.getElementById(ss_grid_prefix+r+"_"+c).firstChild.nodeValue = value;
}

function ss(r,c) {
    var match = document.getElementById(ss_grid_prefix+r+"_"+c).firstChild.nodeValue;
    supersearch_display(match,ss_grid_prefix,ss_grid_rows,ss_grid_cols,ss_results_prefix,ss_result_rows);
}

function longest_substring(list,start) {

    var best = start;
    var minlen = -1;

    // Find shortest string
    for(var i in list) {
        var len = list[i].length;

        if (minlen == -1 || len < minlen ) {
            minlen = len;
        }
    }

    //if the shortest string is the start string then finish
    if (minlen == start.length) return start;


    for(len = start.length + 1 ; len <= minlen ; len ++ ) {
        var next = best;
        for(var i in list) {
            var s = list[i];
            if (best == next ) {
                // first time round at this length pick up the first string
                next = s.substr(0,len);

            } else if (s.substr(0,len) != next ) {
                return best;
            } 
        }
        // Matched against all substrings 
        best = next;
    }
    return best;
}

