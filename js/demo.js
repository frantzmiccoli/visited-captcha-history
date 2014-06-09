(function($) {
    "use strict";
    
    function shuffleArray(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    };
    
    linksList = shuffleArray(linksList);
    
    var FormController = function() {
                          
        this._init = function() {
            this._$message = $('#message');
            this._$visited = $('#visited');
            this._$readMore = $('#read-more');
            this._$form = $('#form');
            this._$typedInput = $('#typed');
            this._$captcha = $('#captcha');

            
            this._charsList = ('abcdefghijklmnopqrstuvwxyz').split('');
            
            this._testSlotsAssociatedLinks = [];
            this._positionsCharsLinks = []; 
            
            this._generateCaptchaSpace();
            
            this._$testSlots = $('.test-slot');
            this._$slots = $('.slot');
            
            this._dispatchLinksAmongTestSlots();
            this._adaptDisplay();
            this._getExpectedRe();
            this._bindListeners();
        };

        this._bindListeners = function() {
            var objectRef = this;
            this._$form.bind('submit', function() {
                objectRef._checkInput();
                return false;
            });
        };
        
        this._generateCaptchaSpace = function() {
            var randomSlots = this._generateRandomCaptchaSlotsSpaceArray();
                                       
            for (var i = 0; i < randomSlots.length; i++) {
                var isTest = (randomSlots[i] === '1'),
                    elementCode = '';
                if (isTest) {
                    elementCode = '<div id="slot-' + i +
                        '" class="slot test-slot" ></div>'
                } else {
                    var randomChar = shuffleArray(this._charsList.slice(0)).pop();
                    elementCode = '<div id="slot-' + i +
                        '" class="slot" data-expected="'+
                        randomChar+'">'+randomChar+'</div>';
                }
                this._$captcha.append($(elementCode));
            }        
            
            this._$captcha.append($('<div class="clear"></div>'));
        };
        
        this._generateRandomCaptchaSlotsSpaceArray = function() {
            var slotsToGenerate = 10,
                testSlotsToGenerate = 3,
                randomSlots = '';
            for (var i = 0; i < slotsToGenerate; i++) {
                if (randomSlots.length < slotsToGenerate - testSlotsToGenerate) {
                    randomSlots += '0'; // 0 means no random
                } else {
                    randomSlots += '1';
                }
            }
            randomSlots = randomSlots.split('');
            var consecutive1 = (randomSlots.join('').indexOf('11') !== -1);
            while (consecutive1) {
                randomSlots = shuffleArray(randomSlots);
                consecutive1 = (randomSlots.join('').indexOf('11') !== -1);
            }
            return randomSlots;
        };
        
        this._dispatchLinksAmongTestSlots = function() {
            var currentTestSlots = 0,
                numberOfTestSlots = this._$testSlots.size();
            
            for (var i = 0; i < numberOfTestSlots; i++) {
                this._testSlotsAssociatedLinks.push([]);
                this._positionsCharsLinks.push({})
            }
            
            for (var linkIndex in linksList) {
                var link = linksList[linkIndex];
                this._testSlotsAssociatedLinks[currentTestSlots].unshift(link);
                currentTestSlots++;
                currentTestSlots %= numberOfTestSlots;
            }
        };
        
        this._adaptDisplay = function() {
            this._adaptTestSlotsDisplay(); 
            this._lookLikeCaptcha();
        };
        
        this._adaptTestSlotsDisplay = function() {
            var objectRef = this;
            this._$testSlots.each(function(index, item) {
                objectRef._setLinksOnSlot(index, $(item));
            });
        };
        
        this._setLinksOnSlot = function(index, $slot) {
            var links = this._testSlotsAssociatedLinks[index];
            
            if (links.length == 0) {
                return;
            }
            
            var linkToInsert = links[0];

            var chars = this._charsList,
                charIndex = Math.floor(Math.random()*chars.length),
                charToInsert = chars[charIndex];
            $slot.append(this._getLinkElement(linkToInsert, charToInsert));
            this._positionsCharsLinks[index][charToInsert] = linkToInsert; 
        };
        
        this._getLinkElement = function(linkToInsert, charToInsert) {
            var aElementCode = '<a href="'+linkToInsert+'">'+charToInsert+"</a>",
                linkElement = $(aElementCode);
            return linkElement;
        };
        
        this._lookLikeCaptcha = function() {
            var cumulatedLeft = 0;
            this._$slots.each(function(index, item) {
                var $item = $(item),
                    top = Math.random() * 10 - 13,
                    left = Math.random() * 10 - 6,
                    angle = Math.random() * 50 - 25;
                cumulatedLeft += left;
                $item.css('top', top);    
                $item.css('left', cumulatedLeft);
                $item.css('-ms-transform', 'rotate('+angle+'deg)');
                $item.css('-webkit-transform', 'rotate('+angle+'deg)');
                $item.css('-o-transform', 'rotate('+angle+'deg)');
                $item.css('transform', 'rotate('+angle+'deg)');
            });
        };
        
        this._checkInput = function() {
            var expectedRe = this._getExpectedRe(),
                typedValue = this._$typedInput.val().split(' ').join(''),
                match = expectedRe.exec(typedValue);
            
            console.log(expectedRe);
            
            if (match === null) {
                this._inputDoesntMatch();
            } else {
                this._inputMatches(match);
            }
        };
        
        this._inputDoesntMatch = function() {
            this._$visited.html('');
            this._$message.removeClass('success');
            this._$message.addClass('error');
            this._$message.html('Sorry that\'s not right.');
            this._$visited.html('');
        };
        
        this._inputMatches = function(match) {
            match.shift();
            var visitedSites = [],
                irrelevantIndexes = ['index', 'input'],
                index;
            
            for (index in match) {
                var invalidIndex = (irrelevantIndexes.indexOf(index) > -1);
                if (invalidIndex) {
                    continue;
                }
                var charFound = match[index];
                if (charFound.length < 1) {
                    continue   
                }
                var site = this._positionsCharsLinks[index][charFound];
                visitedSites.push(site);
            }
            this._$message.removeClass('error');
            this._$message.addClass('success');
            this._$message.html('That\'s right!');
            var visitedMessage = '';
            if (visitedSites.length > 0) {
                visitedMessage = 'Some sites you\'ve visited: <ul>';
                for (index in visitedSites) {
                    if (visitedSites.hasOwnProperty(index)) {
                        var siteUrl = visitedSites[index],
                            siteLink = '<li><a href="'+siteUrl+'" target="_blank">' + siteUrl + '</a></li>';
                        visitedMessage += siteLink;
                    }
                }
                visitedMessage += '</ul>';
            } else {
                visitedMessage = 'We have learn nothing about you browsing history but we could have.';
            }
            this._$visited.html(visitedMessage);
            this._$readMore.show();
        };

        this._getExpectedRe = function() {
            var objectRef = this,
                rePattern = '^',
                testSlotCounter = 0;
            this._$slots.each(function(index, item) {
                var $item = $(item),
                    isTestSlot = $item.hasClass('test-slot');
                
                if (isTestSlot) {
                    var authorizedChars = Object.keys(objectRef._positionsCharsLinks[testSlotCounter]);
                    if (authorizedChars.length < 1) {
                        return true;
                    }
                    var subPattern = '(' + authorizedChars.join('') + '?)';
                    rePattern += subPattern;    
                    testSlotCounter += 1;
                    return true;
                }
                
                var expectedChar = $item.data('expected');
                rePattern += expectedChar;
            });
            rePattern += '$';
            return new RegExp(rePattern, 'i'); // @todo make a regex out of this string
        };
        
        this._init();
    };
    
    $(document).ready(function() {
        new FormController();
    });
})($);