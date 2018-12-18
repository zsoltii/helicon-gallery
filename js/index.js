var INVALID_HTML_ELEMENTS = ["html", "body", "link", "script", "head"];
var currentGallery = null;
var galleryJson = null;
var defaultLanguage = null;
var currentLanguage = null;
var currentPosition = null;
var imagesLength = null;
var queryString = (function(a) { //IE compatible
    if (a == "") return {};
    var b = {};
    for (var i = 0; i < a.length; ++i)
    {
        var p=a[i].split('=', 2);
        if (p.length == 1)
            b[p[0]] = "";
        else
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
    }
    return b;
})(window.location.search.substr(1).split('&'));

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
    
    $('.function i.fa-arrow-up').click(function (e) {
        toggleFullScreen();
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

    $(document).keydown(function (e) {
        if (e.which == 39 && currentPosition < (imagesLength - 1)) {
            $('.goRight a').click();
        } else if (e.which == 37 && currentPosition > 0) {
            $('.goLeft a').click();
        }
    });

    document.onfullscreenchange = function (event) {
        changeFullScreenIcon(event);
    };

    document.MSFullscreenChange = function (event) {
        changeFullScreenIcon(event);
    };

    document.onmozfullscreenchange = function (event) {
        changeFullScreenIcon(event);
    };

    document.onwebkitfullscreenchange = function (event) {
        changeFullScreenIcon(event);
    };
})

function getUrlParameter(parameter) {
    return '' + queryString[parameter];
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
    if (urlLanguage.length > 0 && galleryJson.languages.indexOf(urlLanguage) > -1) {
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

    var logoUrl = null;

    if (galleryJson.logo.hasOwnProperty(language)) {
        $('.logo div').css("background-image", "url('" + galleryJson.logo[language] + "')");
    } else if (galleryJson.logo.hasOwnProperty(defaultLanguage)) {
        $('.logo div').css("background-image", "url('" + galleryJson.logo[defaultLanguage] + "')");
    } else {
        $('.logo div').css("background-image", "url('" + getFirstValue(galleryJson.logo) + "')");
    }

    // $('.logo div').removeClass();
    // $('.logo div').addClass(currentLanguage);

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

    showInfo();
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
        if ((newTitle == undefined) || newTitle == null) {
            newTitle = getFirstValue(galleryJson.title);
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
        if ((newImageTitle == undefined) || newImageTitle == null) {
            newImageTitle = getFirstValue(galleryJson.images[currentPosition].title);
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
        if (arrayContains(galleryJson.images[currentPosition].description), currentLanguage) {
            newDescription = getContent( currentLanguage, "description");
        }
        if (((newDescription == undefined) || newDescription == null) && arrayContains(galleryJson.images[currentPosition].description, defaultLanguage)) {
            newDescription = getContent( defaultLanguage, "description");
        }
        if ((newDescription == undefined) || newDescription == null) {
            newDescription = getContent( getFirstValue(galleryJson.images[currentPosition].description), "description");
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
        if (arrayContains(galleryJson.images[currentPosition].story), currentLanguage) {
            newStory = getContent( currentLanguage, "story");
        }
        if (((newStory == undefined) || newStory == null) && arrayContains(galleryJson.images[currentPosition].story, defaultLanguage)) {
            newStory = getContent( defaultLanguage, "story");
        }
        if ((newStory == undefined) || newStory == null) {
            newStory = getContent( getFirstValue(galleryJson.images[currentPosition].story), "story");
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
        $("#heliconGalley").backstretch('gallery/' + currentGallery + '/image/' + newImageUrl);
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

function toggleFullScreen() {
    if(document.fullscreenElement || document.MSFullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    } else {
        var elem = document.getElementById("heliconGalley");
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        }
    }
}

function changeFullScreenIcon(event) {
    if(document.fullscreenElement || document.msFullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement) {
        $('div i.fas.fa-arrow-up').addClass('fullscreen');
    } else {
        $('div i.fas.fa-arrow-up').removeClass('fullscreen');
    }
}

function getFirstValue(obj) {
    return obj[Object.keys(obj)[0]];
}

function arrayContains(searchableArray, search) {
    return (searchableArray.indexOf(search) > -1);
}

function getContent(language, type) {
    var result = null;
    var url = "gallery/" + currentGallery + "/html/" + galleryJson.images[currentPosition].contentFolder + "/" + language + "/" + type + ".html";
    jQuery.ajax({
        url: url,
        async: false,
        success: function(data) {
            result = data;
        },
        error: function (xhr, ajaxOptions, thrownError){
            console.log("Server error. [status: " + xhr.status + "][throw: " + thrownError + "][url: " + url + "]");
        }
    });
    var invalid = false;
    if (result != null) {
        INVALID_HTML_ELEMENTS.forEach(function (element) {
            if (!invalid && result.toLowerCase().indexOf("<" + element) > -1) {
                invalid = true;
            }
        });
    }

    if (invalid) {
        result = true;
        console.log("Invalid html content. It contains an element: " + INVALID_HTML_ELEMENTS.join(", "));
    }

    return result;
}