var currentGallery = null;
var galleryJson = null;
var defaultLanguage = null;
var currentLanguage = null;
var currentPosition = null;
var imagesLength = null;

$(document).ready(function () {
    currentGallery = getUrlParameter("gallery");

    $.getJSON("gallery/" + currentGallery + "/data.json")
        .done(function (data) {
            initGallery(data);
        }).fail(function (jqxhr, textStatus, error) {
        alert("Gallery data load error: " + textStatus);
    });

    $('.goLeft a').click(function (e) {
       currentPosition--;
       loadImage();
       e.preventDefault();
    });

    $('.goRight a').click(function (e) {
        currentPosition++;
        loadImage();
        e.preventDefault();
    });

    $('.language button').click(function (e) {
        if($('.language div.languageDropDown').hasClass('hidden')) {
            $('.language div.languageDropDown').removeClass('hidden');
        } else {
            $('.language div.languageDropDown').addClass('hidden');
        }
        e.preventDefault();
    });

    $('.language a').click(function (e) {
        $('.language div.languageDropDown').addClass('hidden');
        changeLanguage($(this).attr('data-language'));
        e.preventDefault();
    })
    
    $('.function i.fa-arrows-alt').click(function (e) {
        fullScreen();
        e.preventDefault();
    });

    $('.function i.fa-eye').click(function (e) {
        showInfo();
        e.preventDefault();
    });

    $('.function i.fa-eye-slash').click(function (e) {
        hideInfo();
        e.preventDefault();
    });
})

function getUrlParameter(parameter) {
    var url = new URL(location);
    return '' + url.searchParams.get(parameter);
}

function getGalleryPosition() {
    var hash = '' + location.hash;
    if (hash.length > 0) {
        hash = hash.substr(1);
    }
    return parseInt(hash);
}

function initGallery(data) {
    galleryJson = data;

    var urlLanguage = getUrlParameter("language").trim();
    if (urlLanguage.length > 0 && galleryJson.languages.includes(urlLanguage)) {
        defaultLanguage = urlLanguage;
    } else {
        defaultLanguage = galleryJson.defaultLanguage;
    }

    imagesLength = galleryJson.images.length;
    initCurrentPosition();
    changeLanguage(defaultLanguage);
}

function initCurrentPosition() {
    currentPosition = 0;
    var urlPosition = getGalleryPosition();
    if (!isNaN(urlPosition) && urlPosition > 1) {
        if (urlPosition > imagesLength) {
            currentPosition = imagesLength - 1;
        } else {
            currentPosition = urlPosition - 1;
        }
    }
}

function changeLanguage(language) {
    currentLanguage = language;

    $('.logo div').removeClass();
    $('.logo div').addClass(currentLanguage);

    loadImage();
    $('.language div.languageDropDown').addClass('hidden');
    $('.language button').html($(".language a[data-language='" + currentLanguage + "']").html());
    $('.language a').hide();
    $.each(galleryJson.title, function (index, value) {
        $(".language a[data-language='" + index + "']").show();
    })
}

function loadImage() {
    location.href = '#' + (currentPosition + 1);

    setTitle();
    setImageTitle();
    setDescription();
    setStory();
    setImage();
    processNavigationVisibility();
}

function setTitle() {
    var hasTitle = galleryJson.title;
    var newTitle = null;
    if (hasTitle) {
        newTitle = galleryJson.title[currentLanguage];
        if ((newTitle == undefined) || newTitle == null) {
            newTitle = galleryJson.title[defaultLanguage];
        }
    }

    if ((newTitle == undefined) || newTitle == null) {
        $(".title").text('');
    } else {
        $(".title").text(newTitle);
        document.title = newTitle;
    }
}

function setImageTitle() {
    var hasImageTitle = !(galleryJson.images[currentPosition].title == undefined);
    var newImageTitle = null;

    if (hasImageTitle) {
        newImageTitle = galleryJson.images[currentPosition].title[currentLanguage];
        if ((newImageTitle == undefined) || newImageTitle == null) {
            newImageTitle = galleryJson.images[currentPosition].title[defaultLanguage];
        }
    }

    if ((newImageTitle == undefined) || newImageTitle == null) {
        $(".imageTitle").text('');
    } else {
        $(".imageTitle").text(newImageTitle);
    }
}

function setDescription() {
    var hasDescription = !(galleryJson.images[currentPosition].description == undefined);
    var newDescription = null;

    if (hasDescription) {
        newDescription = galleryJson.images[currentPosition].description[currentLanguage];
        if ((newDescription == undefined) || newDescription == null) {
            newDescription = galleryJson.images[currentPosition].description[defaultLanguage];
        }
    }

    if ((newDescription == undefined) || newDescription == null) {
        $(".description").text('');
        $(".description").hide();
    } else {
        $(".description").html(newDescription);
        $(".description").show();
    }
}

function setStory() {
    var hasStory = !(galleryJson.images[currentPosition].story == undefined);
    var newStory = null;

    if (hasStory) {
        newStory = galleryJson.images[currentPosition].story[currentLanguage];
        if ((newStory == undefined) || newStory == null) {
            newStory = galleryJson.images[currentPosition].story[defaultLanguage];
        }
    }
    if ((newStory == undefined) || newStory == null) {
        $(".story").text('');
        $(".story").hide();
    } else {
        $(".story").html(newStory);
        $(".story").show();
    }
}

function setImage() {
    var newImageUrl = galleryJson.images[currentPosition].url;
    if ((newImageUrl == undefined) || newImageUrl == null) {
        alert("image data error");
    } else {
        $("#heliconGalley").backstretch(newImageUrl);
    }
}

function processNavigationVisibility() {
    if(currentPosition == 0) {
        $('.goLeft').hide();
    } else {
        $('.goLeft').show();
    }

    if (currentPosition == (imagesLength - 1)) {
        $('.goRight').hide();
    } else {
        $('.goRight').show();
    }
}

function hideInfo() {
    $("#heliconGalley div").not('.function').not('.backstretch').not('.backstretch-item').hide();
    $('.function i.fa-eye').show();
    $('.function i.fa-eye-slash').hide();
}

function showInfo() {
    $('.logo, .logo div, .language, .title, .imageTitle').show();
    $('.languageDropDown').removeAttr('style');
    processNavigationVisibility();
    setStory();
    setDescription();
    $('.function i.fa-eye').hide();
    $('.function i.fa-eye-slash').show();
}

function fullScreen() {
    var elem = document.getElementById("heliconGalley");
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
        document.onfullscreenchange = function ( event ) {
            showInfo();
        };
    } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
        document.msonfullscreenchange = function ( event ) {
            showInfo();
        };
    } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
        document.mozonfullscreenchange = function ( event ) {
            showInfo();
        };
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
        document.onwebkitfullscreenchange = function ( event ) {
            showInfo();
        };
    }

    hideInfo();
}