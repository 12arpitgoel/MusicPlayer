let audio=$(`
        <audio></audio>
`);
const globalList=[];
const keys=Object.keys(songsList);
for(let i=0;i<keys.length;i++){
    globalList.push(i);
}


// ************************************************************************************************************
//                              Variables
let track=audio[0];
let now_playing=false;
let trackIndex=-1;
let autoplay=false;
let shuffle=false;

let playLists={
    "globalList":globalList,
    "favoritesList":[],
    // "playList1":[1,3,8,10,15],
    // "playList2":[24,36],
}

let data=localStorage.getItem("playLists");
if(data){
    playLists=JSON.parse(data);
}


let selectedListName="globalList";


// *************************************************************************************************************
//                                          List Events


loadSongsList(playLists[selectedListName]);

function loadSongsList(list){
    for(let i=0;i<list.length;i++ ){
        let idx=list[i];
        let songData=songsList[keys[idx]];
        let favorite=playLists["favoritesList"].includes(idx)?"favorite":"favorite_border"
        let songCard=$(`
            <div class="card-heading">
                <div class="list-index">${i+1}</div>
                <div class="list-title">
                    <div class="list-img-container">
                        <img src="https://tse1.mm.bing.net/th/id/OET.5d57604ae56a44d19d7c0a0851a788da?w=272&h=272&c=7&rs=1&o=5&dpr=1.25&pid=1.9" alt="">
                    </div>
                    <div class="list-song-container">
                        <div class="song-name">${songData.songName}</div>
                        <div class="song-artist">${songData.artist}</div>
                    </div>
                </div>
                <div id="fav-${idx}" class="list-favourite-song"><span class="material-icons">${favorite}</span></div>
                <div class="list-playList-add"><span class="material-icons">add_circle_outline</span></div>
                
            </div>
        `)
        // <div class="list-duration">0:00</div>
        $(".list").append(songCard);

        addListEvents(songCard, i, idx);
    }
    
}

function addListEvents(ele, i, idx){
    
    // playList work
    $(ele[0].querySelector(".list-favourite-song")).click(function(){
        addToPlayList("favoritesList",idx);
        
    })
    $(ele[0].querySelector(".list-playList-add")).click(function(){
        selectPlayList(idx);
    })

    // playing song
    ele.click(function(e){
        let selectedNav=$(".option.selected");
        let navListName=selectedNav.attr("playListName");
        selectedListName=navListName;
        loadTrack(i);
    })

}



function loadTrack(index){
    trackIndex=index;

    $(".card-heading").removeClass("selected");
    $($(".card-heading")[index]).addClass("selected");

    let songData=songsList[keys[playLists[selectedListName][index]]];
    $(".current-song-name").text(songData.songName);
    $(".current-song-artist").text(songData.artist);
    let path=`songs/${songData.songName}.mp3`;
    
    track.src=path;
    track.load();
    let playPromise=playSong();

    playPromise.then(()=>{
        let time=calTime(track.duration);
        $(".end-duration").text(time);
    })

    now_playing=true;
    $(".play-button").text("pause_circle_filled");
}

function calTime(timeInSeconds){
    let mins=(timeInSeconds/60+"").split(".")[0];
    let secs=(timeInSeconds%60+"").split(".")[0];
    let time=mins+":"+(secs.length==1?"0":"")+secs;
    return time;
}

// ************************************************************************************************************
//                                                  Media Buttons


$(".play-button").click(function(){
    if(now_playing){
        pauseSong();
    }
    else{
        if(trackIndex!=-1){
            playSong();
        }
    }
})

function playSong(){
    $(".play-button").text("pause_circle_filled");
    now_playing=true;
    return track.play();
}
function pauseSong(){
    $(".play-button").text("play_circle_filled");
    now_playing=false;
    track.pause();
}

$(".next-button").click(function(){
    playNextSong();
})

function playNextSong(){
    if(trackIndex!=-1){
        let newIndex=(trackIndex+1)%playLists[selectedListName].length;
        // console.log(newIndex);
        loadTrack(newIndex);
    }
}

$(".previous-button").click(function(){
    let newIndex=(trackIndex+playLists[selectedListName].length-1)%playLists[selectedListName].length;
    loadTrack(newIndex);
})

$(".autoplay-button").click(function(){
    shuffle=false;
    $(".shuffle-button").removeClass("selected");
    autoplay=!autoplay;
    $(this).toggleClass("selected");
})

$(".shuffle-button").click(function(){
    autoplay=false;
    $(".autoplay-button").removeClass("selected");
    shuffle=!shuffle;
    $(this).toggleClass("selected");
})

$(".volume").change(function(){
    track.volume=this.value/100;
})

setInterval(function(){
    if(trackIndex!=-1 && now_playing){
        setSliderPosition();
        let time=calTime(track.currentTime);
        $(".current-duration").text(time);
    }
    
},1000);

let slider=$(".song-position");
function setSliderPosition() {
    let value=track.currentTime/track.duration*100;
    // console.log(value);
    slider.val(value);

    if(track.ended){
        if(autoplay){
            trackIndex-=1;
        }
        else if(shuffle){
            let len=playLists[selectedListName].length
            trackIndex=Math.floor(Math.random() * len);
        }
        playNextSong();
    }
}

slider.change(function(){
    track.currentTime=slider.val()/100*track.duration;
})

// *************************************************************************************************************
//                              Nav-Events


// showing navigationList
$(".option").click(function(){
    selectList(this);
})

function selectList(ele){
    let navListName=$(ele).attr("playListName");
    if(!$(ele).hasClass("selected")){
        $(".card-heading").remove();
        $(".option").removeClass("selected");
        $(ele).addClass("selected");
        $(".nav-title").text(navListName);
        loadSongsList(playLists[navListName]);
    }
}

$(".create-playlist").click(function(){
    let createPlayListModal=$(`
        <div class="create-playlist-modal">
            <div class="modal-top">
                <div class="modal-title">Create PlayList</div>
                <div class="modal-input-container">
                    <span class="modal-input-title">Playlist Name:</span>
                    <input class="modal-input" type="text" />
                </div>
                <div class="modal-confirmation">
                    <div class="button active yes-button">OK</div>
                    <div class="button no-button">Cancel</div>
                </div>
            </div>
        </div>
    `)

    $(".container").append(createPlayListModal);
    $(".no-button").click(function () {
        createPlayListModal.remove();
    })

    $(".yes-button").click(function (e) {
        createPlayList();
    });
})

function createPlayList(){
    let newPlayListName = $(".modal-input").val();
    if (newPlayListName && !Object.keys(playLists).includes(newPlayListName)) {
        playLists[newPlayListName]=[];
        addPlayList(newPlayListName)
        $(".create-playlist-modal").remove();

    } else {
        $(".name-error").remove();
        $(".modal-input-container").append(`
            <div class="name-error"> PlayList Name is not valid or playlist already exists! </div>
        `)
    }
}

function addPlayListDivs(){
    let playListNames=Object.keys(playLists);
    for(let i=2;i<playListNames.length;i++){
        addPlayList(playListNames[i]);
    }    
}

addPlayListDivs();

function addPlayList(playListName){
    let newPlDiv=$(`<div playListName="${playListName}" class="option">${playListName}</div>`);
    $(".playlists-container").append(newPlDiv);

    newPlDiv.click(function(){
        selectList(this);
    })
}


// *************************************************************************************************************
// PlayList Events

function selectPlayList(idx){
    let selectModal=$(`
        <div class="create-playlist-modal">
            <div class="modal-top">
                <div class="modal-title">Select PlayList</div>
                <div class="playlist-list"></div>
                
                <div class="modal-confirmation">
                    <div class="button yes-button">OK</div>
                    <div class="button no-button">Cancel</div>
                </div>
            </div>
        </div>
    `)
    let playListNames=Object.keys(playLists);
    let listName;
    let plList=selectModal[0].querySelector(".playlist-list");
    for(let i=2;i<playListNames.length;i++){
        let div=$(`<div playListName="${playListNames[i]}" class="option">${playListNames[i]}</div>`);
        div.click(function(){
            $(".option").removeClass("selected");
            $(this).addClass("selected");
            $(".yes-button").addClass("active");
            listName=playListNames[i];
        })
        $(plList).append(div);
    }  

    $(".playlists-container").append(selectModal);
    $(".no-button").click(function () {
        selectModal.remove();
    })


    $(".yes-button").click(function (e) {
        if($(this).hasClass("active")){
            addToPlayList(listName,idx)
            selectModal.remove();
        }
        
    });
    
}

function addToPlayList(listName,idx){
    let arr=playLists[listName];
    
    let i=arr.indexOf(idx);
    if(i!=-1){
        playLists[listName]=arr.filter((el,index)=>{
            return index!=i;
        })
        if(listName=="favoritesList"){
            $("#fav-"+idx+" span").text("favorite_border");
        }
    }
    else{
        arr.push(idx);
        
        if(listName=="favoritesList"){
            $("#fav-"+idx+" span").text("favorite");
        }
    }
    localStorage.setItem("playLists",JSON.stringify(playLists));
}

// *********************************************************************
//                      Searching

$(".search-input").keyup(function(){
    let currSearchText=$(this).val();
    let filteredArr = [];
    if (currSearchText === "") {
        filteredArr = playLists[selectedListName];
    }
    else {
        filteredArr = playLists[selectedListName].filter((ele) => {
            let title = keys[ele].toLowerCase();
            if(title.includes(currSearchText.toLowerCase())){
                return ele;
            }
        })
    }
    $(".card-heading").remove();
    loadSongsList(filteredArr);
})