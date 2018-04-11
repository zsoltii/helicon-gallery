var currentGallery = null;
var galleryJson = null;
var defaultLanguage = null;
var currentLanguage = null;

$(document).ready(function () {
    currentGallery = getGallery();

    $.getJSON("gallery/" + currentGallery + "/data.json")
        .done(function (data) {
            initGallery(data);
        }).fail(function (jqxhr, textStatus, error) {
        alert("Gallery data load error: " + textStatus);
    });
})

function getGallery() {
    var url = new URL(location);
    return '' + url.searchParams.get("gallery");
}

function initGallery(data) {
    galleryJson = data;

    defaultLanguage = galleryJson.defaultLanguage;
    changeLanguage(defaultLanguage);
}

function changeLanguage(language) {
    currentLanguage = language;

    setTitle();
    setImageTitle(0);
    setDescription(0);
    setStory(0);
    setImage(0);
}

function setTitle() {
    newTitle = galleryJson.name[currentLanguage];
    if ((newTitle == undefined) || newTitle == null) {
        newTitle = galleryJson.name[defaultLanguage];
    }
    $(".title").text(newTitle);
}

function setImageTitle(position) {
    newImageTitle = galleryJson.images[position].title[currentLanguage];
    if ((newImageTitle == undefined) || newImageTitle == null) {
        newImageTitle = galleryJson.images[position].title[defaultLanguage];
    }
    $(".imageTitle").text(newImageTitle);
}

function setDescription(position) {
    newDescription = galleryJson.images[position].story[currentLanguage];
    if ((newDescription == undefined) || newDescription == null) {
        newDescription = galleryJson.images[position].story[defaultLanguage];
    }
    if ((newDescription == undefined) || newDescription == null) {
        $(".description").text('');
        $(".description").hide();
    } else {
        $(".description").html(newDescription);
        $(".description").show();
    }
}

function setStory(position) {
    newStory = galleryJson.images[position].story[currentLanguage];
    if ((newStory == undefined) || newStory == null) {
        newStory = galleryJson.images[position].story[defaultLanguage];
    }
    if ((newStory == undefined) || newStory == null) {
        $(".story").text('');
        $(".story").hide();
    } else {
        $(".story").html(newStory);
        $(".story").show();
    }
}

function setImage(position) {
    newImageUrl = galleryJson.images[position].url;
    if ((newImageUrl == undefined) || newImageUrl == null) {
        alert("image data error");
    } else {
        $("#heliconGalley").backstretch(newImageUrl);
    }

}