function formatDate(date) {
    var d     = new Date(date),
        month = '' + (d.getMonth() + 1),
        day   = '' + d.getDate(),
        year  = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [year, month, day].join('-');
}
function LoadProjects() {
    var XMLhttp = new XMLHttpRequest();
    XMLhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var ProjectsListJSON = JSON.parse(this.responseText);
            ProjectList = [];
            for (var i=0; i <ProjectsListJSON.length; i++) {
                ProjectList.push(ProjectsListJSON[i]);
            }
            OrderByName();
            CarouselCreate(ProjectList);
        }
    };
    XMLhttp.open("GET", "https://api.github.com/users/andreabenini/repos?per_page=200", true);
    XMLhttp.setRequestHeader('Accept', 'application/vnd.github.mercy-preview+json');    // Extra topic attributes (github experimental)
    XMLhttp.send();
}
function DisplayClearDiv() {
    var DivProjectList = document.getElementById("ProjectList");
    DivProjectList.innerHTML = '';
    var Table = document.createElement('table');
    Table.id = "projectListTable";
    var Row = Table.insertRow(0);
    var Cell1 = Row.insertCell(0); Cell1.innerHTML = "<h5><a class='orderlink' id='linkName' href='#' onclick='OrderByName();'>Name</a>  (<a class='orderlink' id='linkTopics' href='#' onclick='OrderByTopic();'>Topic</a>)</h5>";
    var Cell2 = Row.insertCell(1); Cell2.innerHTML = "";
    var Cell3 = Row.insertCell(2); Cell3.innerHTML = "<h5>Description</h5>";
    var Cell4 = Row.insertCell(3); Cell4.innerHTML = "<h5><a class='orderlink' id='linkDateModified' href='#' onclick='OrderByDateModified();'>Modified</a></h5>";
    var Cell5 = Row.insertCell(4); Cell5.innerHTML = "<h5 class='projectListCreationDate'><a class='orderlink' id='linkDateCreated'  href='#' onclick='OrderByDateCreated();'>Created</a></h5>";
    return Table;
}
function DisplayTable(Projects, Table) {
    for (var i=0; i<Projects.length; i++) {
        var Row = Table.insertRow(-1);
        var Link = Projects[i].html_url;
        if (!Projects[i].fork && Projects[i].homepage!="" && Projects[i].homepage!=null) {
            Link = Projects[i].homepage;
        }
        var CellName        = Row.insertCell(0);  CellName.innerHTML        = "<a href='"+Link+"'>"+Projects[i].name+"</a>";
        var CellFork        = Row.insertCell(1);  CellFork.innerHTML        = Projects[i].fork? ".": "";
        var CellDescription = Row.insertCell(2);  CellDescription.innerHTML = Projects[i].description;
        var CellUpdated     = Row.insertCell(3);  CellUpdated.innerHTML     = formatDate(Projects[i].updated_at)+"&nbsp;&nbsp;"; CellUpdated.style.whiteSpace = 'nowrap';
        var CellCreated     = Row.insertCell(4);  CellCreated.innerHTML     = formatDate(Projects[i].created_at); CellCreated.setAttribute("class", "projectListCreationDate");
    }
    var DivProjectList = document.getElementById("ProjectList");
    DivProjectList.appendChild(Table);
}
function DisplayTableTopics() {
    Table = DisplayClearDiv();
    var DivProjectList = document.getElementById("ProjectList");
    Object.keys(ProjectTopicList).sort().forEach(function(key) {        // Topic sort order. Cannot be done inside an associative array so I'll do that in a foreach loop
        if (ProjectTopicList[key].length > 0) {
            var TopicLabel = (key=='0')? 'no tags': key;
            var Row = Table.insertRow(-1);
            var Cell1 = Row.insertCell(0); Cell1.innerHTML = "<strong><br/>["+TopicLabel+"]</strong>"; Cell1.style.whiteSpace = 'nowrap';
            var Cell2 = Row.insertCell(1); Cell2.innerHTML = "";
            var Cell3 = Row.insertCell(2); Cell3.innerHTML = "";
            var Cell4 = Row.insertCell(3); Cell4.innerHTML = "";
            var Cell5 = Row.insertCell(4); Cell5.innerHTML = "";
            DisplayTable(ProjectTopicList[key], Table);
        }
    })
}
function OrderByName() {
    ProjectList.sort(function(a, b) {
        if (a.name < b.name)
            return -1;
        return 1;
    });
    Table = DisplayClearDiv();
    DisplayTable(ProjectList, Table);
    DisableLink('linkName');                    // Disable link
}
function OrderByDateModified() {
    ProjectList.sort(function(a, b) {
        if (a.updated_at < b.updated_at)
            return -1;
        return 1;
    });
    Table = DisplayClearDiv();
    DisplayTable(ProjectList, Table);
    DisableLink('linkDateModified');           // Disable link
}
function OrderByDateCreated() {
    ProjectList.sort(function(a, b) {
        if (a.created_at < b.created_at)
            return -1;
        return 1;
    });
    Table = DisplayClearDiv();
    DisplayTable(ProjectList, Table);
    DisableLink('linkDateCreated');           // Disable link
}
function OrderByTopic() {
    // Topic list population
    ProjectTopicList = [];
    ProjectTopicList[0] = [];
    for (var i=0; i<ProjectList.length; i++) {
        if (ProjectList[i].topics.length==0) {
            ProjectTopicList[0].push(ProjectList[i]);
        } else {
            for (var j=0; j<ProjectList[i].topics.length; j++) {
                if (typeof(ProjectTopicList[ProjectList[i].topics[j]]) != 'object') {
                    ProjectTopicList[ ProjectList[i].topics[j] ] = [];
                }
                // if (ProjectList[i].topics[j])
                ProjectTopicList[ ProjectList[i].topics[j] ].push(ProjectList[i]);
            }
        }
    }
    // Ordering elements inside topics
    for (var i=0; i<ProjectTopicList.length; i++) {
        ProjectTopicList[i].sort(function(a, b) {
            if (a.name < b.name)
                return -1;
            return 1;
        })
    }
    // Display
    DisplayTableTopics();
    DisableLink('linkTopics');          // Disable link
}
function DisableLink(LinkName) {
    document.getElementById('linkName').setAttribute('href', '#');
    document.getElementById('linkTopics').setAttribute('href', '#');
    document.getElementById('linkDateModified').setAttribute('href', '#');
    document.getElementById('linkDateCreated').setAttribute('href', '#');
    document.getElementById(LinkName).removeAttribute('href');
}


function CarouselCreate(Projects) {
    let ol  = document.getElementById("carousel_ol");
    let div = document.getElementById("carousel_div");
    let count = 0;
    let randomStart = Math.floor(Math.random() * Projects.length);
    for (let i=0; i<Projects.length; i++) {
        let current = i+randomStart >= Projects.length ? i+randomStart-Projects.length: i+randomStart;
        if (!Projects[current].fork) {
            // Carousel OL          // <li data-target="" data-slide-to="1" class="active"></li>
            let li = document.createElement("li");
            li.appendChild(document.createTextNode(""));
            li.setAttribute("data-target", "#carouselIndicators");
            li.setAttribute("data-slide", count);
            if (count==0) {
                li.setAttribute("class", "active");
            } else {
                li.setAttribute("class", "");
            }
            ol.appendChild(li);

            // carousel DIV
            let divInner = document.createElement("div");
            divInner.innerHTML = "<div class='carousel-caption d-none d-md-block'><h3>"+
                                    Projects[current].name +
                                 "</h3><p>"+
                                    Projects[current].description +
                                 "</p></div>";
            if (count==0) {
                divInner.setAttribute("class", "carousel-item active");
            } else {
                divInner.setAttribute("class", "carousel-item");
            }
            // carousel hyperlink
            let Link = Projects[current].html_url;
            if (!Projects[current].fork && Projects[current].homepage!="" && Projects[current].homepage!=null) {
                Link = Projects[current].homepage;
            }
            divInner.setAttribute("onclick", "window.location='"+Link+"';");
            // background
            divInner.setAttribute("style", "background-image: url('https://raw.githubusercontent.com/andreabenini/" + Projects[current].name + "/master/logo.png'); "+
                                           "background-size: cover; text-shadow: 1px 1px #0039ff");
            div.appendChild(divInner);
            //
            count++;
        }
    }
} /**/

function animation(Toggle) {
    if (Toggle) {
        document.getElementById("bubble-boxes").style.display = "block";
        document.getElementById("animation").href = "javascript:animation(false);"
        document.getElementById("animation").text = "Disable CSS Animation";
    } else {
        document.getElementById("bubble-boxes").style.display = "none";
        document.getElementById("animation").href = "javascript:animation(true);"
        document.getElementById("animation").text = "Enable CSS Animation";
    }
} /**/
