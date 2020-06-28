window.__reggie || (window.__reggie = {});

(function(document, __reggie) {

    var me = __reggie.slider || (__reggie.slider = {}),
        sliderApp = {};

    me.sliderApp = {

        init: function() {
            // collect all slideshow templates
            sliderApp.slideshows = document.querySelectorAll('.reggie-slider-template');

            // construct each slider instance
            for (var i = 0; i < sliderApp.slideshows.length; ++i) {
                me.sliderApp.constructSlider(sliderApp.slideshows[i]);
            }
        },
        constructSlider: function(el) {
            var container = document.createElement('div'),
                outerStage = document.createElement('div'),
                innerStage = document.createElement('div'),
                template,
                clone,
                cloneParent,
                i,
                j,
                slide;

            container.classList.add('reggie-slider');
            outerStage.classList.add('reggie-slider-outer');
            innerStage.classList.add('reggie-slider-inner');

            container.setAttribute('id', 'reggie-slider-' + el.getAttribute('data-id'));

            for (i = 0; i < el.attributes.length; i++) {
                if (el.attributes[i].name != 'class') container.setAttribute(el.attributes[i].name, el.attributes[i].value);
            }

            if (el.getAttribute('data-auto-height') == 'true') outerStage.classList.add('reggie-slider-height');
            
            if ('content' in document.createElement('template')) {
                template = document.importNode(el.content, true);
                for (i = 0; i < template.children.length; i++) {
                        clone = template.children[i],
                        slide = document.createElement('div');

                    slide.classList.add('reggie-slider-item');
                    if (el.hasAttribute('data-columns')) {
                        if (i < utilities.visibleSlides(el)) slide.classList.add('active');
                    } else {
                        if (i === 0) slide.classList.add('active');
                    }
                    slide.setAttribute('data-item', (i + 1));
                    slide.appendChild(document.importNode(clone, true));
                    innerStage.appendChild(slide);
                }
                if (el.hasAttribute('data-columns')) {
                    var slides = document.importNode(el.content, true),
                        visibleSlides = utilities.visibleSlides(el);
                        
                    if(visibleSlides > slides.children.length) visibleSlides = slides.children.length;

                    for (j = 0; j < slides.children.length; j++) {
                        if (j < visibleSlides) {
                            var clones = slides.children[j];
                            cloneParent = document.createElement('div');
                            cloneParent.classList.add('reggie-slider-item');
                            cloneParent.classList.add('clone');
                            cloneParent.setAttribute('data-item', (slides.children.length + j + 1));
                            if(!el.hasAttribute('data-blankclones')){
                                cloneParent.appendChild(document.importNode(clones, true));
                            }
                            innerStage.appendChild(cloneParent);
                        }
                    }
                }
            } else {
                // IE Polyfill
                      
                template = document.createDocumentFragment();
                var children = el.childNodes;
                for (i = 0; i < children.length; i++) {
                    if (children[i].nodeType != 1) continue;
                    template.appendChild(children[i].cloneNode(true));
                }
                for (i = 0; i < template.childNodes.length; i++) {
                    clone = template.childNodes[i],
                    slide = document.createElement('div');
                    
                    slide.classList.add('reggie-slider-item');
                    if (el.hasAttribute('data-columns')) {
                        if (i < utilities.visibleSlides(el)) slide.classList.add('active');
                    } else {
                        if (i === 0) slide.classList.add('active');
                    }
                    slide.setAttribute('data-item', (i + 1));
                    slide.appendChild(document.importNode(clone, true));
                    innerStage.appendChild(slide);
                }
                if (el.hasAttribute('data-columns')) {
                    var df = document.createDocumentFragment();

                    for (j = 0; j < children.length; j++) {
                        if (children[j].nodeType != 1) continue;
                        df.appendChild(children[j].cloneNode(true));
                    }
                    for (j = 0; j < utilities.visibleSlides(el); j++) {
                            clone = df.childNodes[j],
                            cloneParent = document.createElement('div');
                            cloneParent.classList.add('reggie-slider-item');
                            cloneParent.classList.add('clone');
                            cloneParent.setAttribute('data-item', (df.childNodes.length + j + 1));
                            if(!el.hasAttribute('data-blankclones')){
                                cloneParent.appendChild(document.importNode(clone, true));
                            }
                            innerStage.appendChild(cloneParent);
                    }
                    
                }
            }
            
            outerStage.appendChild(innerStage);
            container.appendChild(outerStage);
            el.parentElement.appendChild(container);

            /* shim for IE11 - Remove template children after slides are created */
            while (el.firstChild) {
                el.removeChild(el.firstChild);
            }

            utilities.setTranslate(container, 1);
            utilities.loaded(container);
            
            this.observeSlider(container);
            this.setStage(container);
            this.createNavigation(container);
            this.createListener(container);
            
        },
        observeSlider: function(el) {
            el.autoslide = {
                'allowAutoSlide': null,
                'timer': null
            };
            if ('IntersectionObserver' in window &&
            'IntersectionObserverEntry' in window &&
            'intersectionRatio' in window.IntersectionObserverEntry.prototype) {
            
            var slideshowContainer = el.querySelector('.reggie-slider-inner'),
            bLeaving = false,
            observer = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        bLeaving = true;
                        el.autoslide.allowAutoSlide = true;
                        utilities.autoSlide(el);
                    } else if (bLeaving) {
                        bLeaving = false;
                        el.autoslide.allowAutoSlide = false;
                        utilities.autoSlide(el);
                    }
                });
            });
            
            observer.observe(slideshowContainer);
            }
        },
        setStage: function(el) {
            utilities.stageSize(el);
        },
        createNavigation: function(el) {
            var slides = el.querySelectorAll('.reggie-slider-item'),
                cloneSlides = el.querySelectorAll('.reggie-slider-item.clone'),
                realSlides = 0,
                visibleSlides = utilities.visibleSlides(el),
                showNav = true;

            if(slides && cloneSlides){
                realSlides = slides.length - cloneSlides.length;
                if(realSlides <= visibleSlides){ showNav = false; }
            }

            if (el.getAttribute('data-arrows') == 'true' && showNav) {

                /** Navigation container */
                var navContainer = document.createElement('div');
                navContainer.classList.add('reggie-slider-controls');
                navContainer.classList.add('reggie-slider-controls-top');
                if (el.getAttribute('data-slider-type') == 'pagination') navContainer.classList.add('hidden-print');

                /** Navigation btns */
                var nextBtn = utilities.arrowElement(el, {'text':'Next', 'btn':'reggie-slider-next', 'icon':'fa-chevron-right'}),
                    prevBtn = utilities.arrowElement(el, {'text':'Previous', 'btn':'reggie-slider-previous', 'icon':'fa-chevron-left'});

                /** Merge btns with container */
                navContainer.appendChild(prevBtn);
                navContainer.appendChild(nextBtn);

                el.prepend(navContainer);

            }
        },
        previousSlide: function(el) {
            var slideshowContainer = el.querySelector('.reggie-slider-inner'),
                activeSlide = el.querySelector('.active'),
                curPos = parseInt(utilities.currentPosition(el)),
                offset = parseInt(utilities.visibleSlides(el)),
                nextPos = curPos - offset,
                totalSlides = slideshowContainer.children.length,
                clones = parseInt(el.getAttribute('data-columns')),
                contentTotal = totalSlides - clones,
                nextLastPos = utilities.visibleSlides(el) == 1 ? nextPos : nextPos + (offset - 1),
                previousSiblingCheck = (!activeSlide.previousElementSibling) ? true : false;
                
            if (el.hasAttribute('data-columns')) {
                
                if (curPos <= 1) {
                    nextPos = contentTotal;
                    nextLastPos = offset == 1 ? contentTotal : contentTotal + (offset - 1);
                }
        
                for (var i = 0; i < slideshowContainer.children.length; i++) {
                    var sNum = slideshowContainer.children[i].dataset.item;
                        if (sNum >= nextPos && sNum <= nextLastPos) {
                            slideshowContainer.children[i].classList.add('active');
                        } else {
                            slideshowContainer.children[i].classList.remove('active');
                        }
                }
                utilities.setTranslate(el, nextPos);
            } else {
                if (previousSiblingCheck) {
                    slideshowContainer.lastElementChild.classList.add('active');
                    utilities.setTranslate(el, totalSlides);
                    utilities.beforeSlide(el, totalSlides);
                } else {
                    var itemPos = activeSlide.previousElementSibling.dataset.item;
                    activeSlide.previousElementSibling.classList.add('active');
                    utilities.setTranslate(el, itemPos);
                    utilities.beforeSlide(el, itemPos);
                }
    
                setTimeout(function() {
                    activeSlide.classList.remove('active');
                }, 100);
            }
            setTimeout(function() {
                utilities.afterSlide(el, 'prev');
            }, 100);
        },
        nextSlide: function(el) {
            var activeSlide = el.querySelector('.active'),
            slideshowContainer = el.querySelector('.reggie-slider-inner'),
            curPos = parseInt(utilities.currentPosition(el)),
            offset = parseInt(utilities.visibleSlides(el)),
            nextPos = curPos + offset,
            totalSlides = slideshowContainer.children.length,
            clones = parseInt(el.getAttribute('data-columns')),
            contentTotal = totalSlides - clones,
            nextLastPos = utilities.visibleSlides(el) == 1 ? nextPos : nextPos + (offset - 1),
            nextSiblingCheck = (!activeSlide.nextElementSibling) ? true : false;
                        
            if (el.hasAttribute('data-columns')) {               
                
                if (nextPos > contentTotal) {
                    nextPos = 1;
                    nextLastPos = utilities.visibleSlides(el) == 1 ? nextPos : nextPos + (offset - 1);
                }
                
                for (var i = 0; i < slideshowContainer.children.length; i++) {
                    var sNum = slideshowContainer.children[i].dataset.item;
                         if (sNum >= nextPos && sNum <= nextLastPos) {
                            slideshowContainer.children[i].classList.add('active');
                        } else {
                            slideshowContainer.children[i].classList.remove('active');
                        }
                }
                utilities.setTranslate(el, nextPos);
            } else {
                if (nextSiblingCheck) {
                    slideshowContainer.firstElementChild.classList.add('active');
                    utilities.setTranslate(el, 1);
                    utilities.beforeSlide(el, 1);
                } else {
                    var itemPos = activeSlide.nextElementSibling.dataset.item;
                    activeSlide.nextElementSibling.classList.add('active');
                    utilities.setTranslate(el, itemPos);
                    utilities.beforeSlide(el, itemPos);
                }
        
                setTimeout(function() {
                    activeSlide.classList.remove('active');
                }, 100);
            }
            setTimeout(function() {
                utilities.afterSlide(el, 'next');
            }, 100);
        },
        createListener: function(el) {
            var slideshowContainer = el.querySelector('.reggie-slider-inner'),
                btnsNext = el.querySelectorAll('.reggie-slider-next'),
                btnsPrev = el.querySelectorAll('.reggie-slider-previous'),
                i;

            for (i = 0; i < btnsPrev.length; ++i) {
                btnsPrev[i].addEventListener('click', function() {
                    me.sliderApp.previousSlide(el);
                });
            }

            for (i = 0; i < btnsNext.length; ++i) {
                btnsNext[i].addEventListener('click', function() {
                    me.sliderApp.nextSlide(el);
                });
            }

            if (el.getAttribute('data-auto-slide') == 'true') {
                slideshowContainer.addEventListener('mouseover', function() {
                    el.autoslide.allowAutoSlide = false;
                    utilities.autoSlide(el);
                });

                slideshowContainer.addEventListener('mouseout', function() {
                    el.autoslide.allowAutoSlide = true;
                    utilities.autoSlide(el);
                });
            }   

            if (el.getAttribute('data-swipe') == 'true') {            
                slideshowContainer.addEventListener("click", function(e) {
                    utilities.freezeClick(el, e);
                });

                slideshowContainer.addEventListener('touchstart', function(e) {
                    utilities.moveStart(el, e);
                });

                slideshowContainer.addEventListener('mousedown', function(e) {
                    utilities.moveStart(el, e);
                });

                slideshowContainer.addEventListener('pointerdown', function(e) {
                    utilities.moveStart(el, e);
                });

                slideshowContainer.addEventListener('MSPointerDown', function(e) {
                    utilities.moveStart(el, e);
                });

                slideshowContainer.addEventListener('touchmove', function(e) {
                    utilities.moveSlider(el, e);
                });

                slideshowContainer.addEventListener('pointermove', function(e) {
                    utilities.moveSlider(el, e);
                });

                slideshowContainer.addEventListener('mousemove', function(e) {
                    utilities.moveSlider(el, e);
                });

                slideshowContainer.addEventListener('MSPointerMove', function(e) {
                    utilities.moveSlider(el, e);
                });

                slideshowContainer.addEventListener('touchend', function(e) {
                    utilities.moveEnd(el, e);
                });

                slideshowContainer.addEventListener('mouseup', function(e) {
                    utilities.moveEnd(el, e);
                });

                slideshowContainer.addEventListener('pointerup', function(e) {
                    utilities.moveEnd(el, e);
                });

                slideshowContainer.addEventListener('mouseleave', function(e) {
                    utilities.moveEnd(el, e);
                });

                slideshowContainer.addEventListener('MSPointerUp', function(e) {
                    utilities.moveEnd(el, e);
                });
            }
                        
            var resizeTimer;
            
            window.addEventListener('resize', function() {
                el.querySelector('.reggie-slider-inner').classList.add('reggie-slider-resizing');
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(function() {
                    var activeSlide = el.querySelector('.active').dataset.item;
                    utilities.stageSize(el);
                    utilities.setTranslate(el, activeSlide);
                    utilities.autoHeight(el, activeSlide);
                    utilities.visibleSlides(el);
                    utilities.moveActiveClass(el);
                    el.querySelector('.reggie-slider-inner').classList.remove('reggie-slider-resizing');
                }, 250);
            });
            
        }
    };
    var utilities = {
        freezeClick: function(el, e) {           
            if (el.movement.bClick === false) {
                e.stopPropagation();
                e.preventDefault();
            }
        },
        loaded: function(el) {
            var hasSibling = (el.querySelector('[data-item="1"]').nextElementSibling) ? true : false;
            
            if (hasSibling) {               
                this.lazyLoad(el, 2);
                this.autoHeight(el, 1);
            }
            el.movement = {
                'bClick': true
            };
        },
        beforeSlide: function(el, pos) {
            this.lazyLoad(el, pos);
        },
        afterSlide: function(el, dir) {
            var slideshowContainer = el.querySelector('.reggie-slider-inner'),
                activeSlide = el.querySelector('.active').dataset.item,
                event = new CustomEvent('reggieCarouselSlid');
            
            el.dispatchEvent(event);
                     
            if (el.querySelector('.active').nextElementSibling) this.lazyLoad(el, el.querySelector('.active').nextElementSibling.dataset.item);
            utilities.autoHeight(el, activeSlide);
            if (el.movement) el.movement.x = slideshowContainer.firstElementChild.offsetWidth * (activeSlide - 1);
        },
        currentPosition: function(el) {
            var activeSlide = el.querySelector('.active').dataset.item;
            return activeSlide;
        },
        visibleSlides: function (el) {
            var w = window.innerWidth,
            columns;
            if (el.hasAttribute('data-columns')) {
                if (w < 992 && w > 769) {
                    columns = 2;
                } else if (w < 768) {
                    columns = 1;
                } else {
                    columns = el.getAttribute('data-columns');
                }
            } else {
                columns = 1;
            }
            return columns;
        },
        moveActiveClass: function(el) {
            if (el.hasAttribute('data-columns')) {
                var slideshowContainer = el.querySelector('.reggie-slider-inner'),
                curPos = parseInt(utilities.currentPosition(el)),
                offset = parseInt(utilities.visibleSlides(el));
        
                for (var i = 0; i < slideshowContainer.children.length; i++) {
                    var sNum = slideshowContainer.children[i].dataset.item;
                        if (sNum >= curPos && sNum <= (curPos + (offset-1))) {
                            slideshowContainer.children[i].classList.add('active');
                        } else {
                            slideshowContainer.children[i].classList.remove('active');
                        }
                }
            }
        },
        arrowElement: function(el, object) {
            var df = document.createDocumentFragment(),
                btn = document.createElement('div'),
                icon = document.createElement('i');

            btn.classList.add(object.btn);

            icon.classList.add('fas');
            icon.classList.add(object.icon);

            btn.appendChild(icon);
            return df.appendChild(btn);
        },
        stageSize: function(el) {
            var slideshowContainer = el.querySelector('.reggie-slider-inner'),
            slideshowOuterStage = el.querySelector('.reggie-slider-outer'),
            slides = el.querySelectorAll('.reggie-slider-item'),
            slideWidthOffset = this.visibleSlides(el) == 1 && window.innerWidth < 768  ? 80 : 0;
        
            for (var i = 0; i < slides.length; i++) {
                if (el.hasAttribute('data-columns')) {
                    slides[i].style.marginRight = '15px';
                    slides[i].style.width = (((slideshowOuterStage.offsetWidth - slideWidthOffset) - ((this.visibleSlides(el) - 1) * 15)) / this.visibleSlides(el)) + 'px';                    
                } else {
                    slides[i].style.width = slideshowOuterStage.offsetWidth + 'px'; 
                }
            }
            if (el.hasAttribute('data-columns')) {
                slideshowContainer.style.transition = 'all 1.5s ease 0s';
                slideshowContainer.style.width = (slideshowOuterStage.offsetWidth + 15) * slides.length + 'px';
                if (this.visibleSlides(el) == 1 && window.innerWidth < 768) {
                    slideshowContainer.style.paddingLeft = '40px';
                    slideshowContainer.style.paddingRight = '40px';
                } else {
                    slideshowContainer.style.paddingLeft = '';
                    slideshowContainer.style.paddingRight = '';
                }                
            } else {
                slideshowContainer.style.width = slideshowOuterStage.offsetWidth * slides.length + 'px';
                slideshowContainer.style.transition = 'all 0.25s ease 0s';
            }
        },
        setTranslate: function(el, pos) {
            var slideshowContainer = el.querySelector('.reggie-slider-inner'),
                activeSlide = el.querySelector('[data-item="' + pos + '"]'),
                translatePos,
                marginRight = el.hasAttribute('data-columns') ? 15 : 0;
                
                if (pos == 1) {
                    translatePos = 0;
                } else {
                    translatePos = (pos - 1) * (activeSlide.getBoundingClientRect().width + marginRight);
                }         
                
            slideshowContainer.style.transform = "translate3d(" + -translatePos + "px, 0, 0)";
        },
        lazyLoad: function(el, pos) {
            if (el.getAttribute('data-lazy-load') == 'true') {
                var activeSlide = el.querySelector('[data-item="' + pos + '"]'), 
                    slide = activeSlide.querySelector('.img-responsive');
                    
                if ((slide && !slide.src) || slide && slide.getAttribute('data-src') != slide.src) {
                    slide.setAttribute('src', slide.getAttribute('data-src'));
                    slide.onload = function() {
                        utilities.hideLoader(el, pos);
                    };
                }
            }
        },
        autoHeight: function(el, pos) {
            if (el.getAttribute('data-auto-height') == 'true') {
                var activeSlide = el.querySelector('[data-item="' + pos + '"]'),
                    activeSlideHeight = activeSlide.offsetHeight,
                    autoHeightClass = el.querySelector('.reggie-slider-height');
                    setTimeout(function() {
                        autoHeightClass.style.height = activeSlideHeight + 'px';
                    }, 300);
            }
        },
        /* hideLoader: function(el, pos) {
            var activeSlide = el.querySelector('[data-item="' + pos + '"]'),
                loadingSlide = activeSlide.querySelector('.loading-slide');
            if (loadingSlide) loadingSlide.style.display = 'none';
        }, */
        autoSlide: function(el) {
            if (el.getAttribute('data-auto-slide') == 'true') {                
               if (el.autoslide.allowAutoSlide === true) {
                   if (typeof el.autoslide.timer == 'undefined') el.autoslide.timer = false;
                   if (!el.autoslide.timer) {
                        el.autoslide.timer = setInterval(function() {
                            me.sliderApp.nextSlide(el);
                        }, 5000);
                    }
               } else {
                    clearInterval(el.autoslide.timer);
                    el.autoslide.timer = false;
               }
            }
        },
        moveStart: function(el, e) {
            var slideshowContainer = el.querySelector('.reggie-slider-inner'),
                point = e.touches ? e.touches[0] : e,
                aElements = slideshowContainer.getElementsByTagName('a'),
                imgElements = slideshowContainer.getElementsByTagName('img'),
                i;

                if (!el.movement) {
                    el.movement = {
                        'bClick': false,
                        'directionLock': false,
                        'distanceX': 0,
                        'distanceY': 0,
                        'initiated': false,
                        'pointX': 0,
                        'pointY': 0,
                        'startX': 0,
                        'x': 0
                    };
                }
            
            el.movement.initiated = true;
            el.movement.pointX = point.pageX;
            el.movement.pointY = point.pageY;
            el.movement.startX = point.pageX;

            for(i = 0; i < aElements.length; i++) {
                aElements[i].ondragstart = function(el, e) {
                    return false;
                };
            }

            for(i = 0; i < imgElements.length; i++) {
                imgElements[i].ondragstart = function(el, e) {
                    return false;
                };
            }
        },
        moveSlider: function(el, e) {
            if (el.movement && el.movement.initiated) {

                var slideshowContainer = el.querySelector('.reggie-slider-inner'),
                point = e.touches ? e.touches[0] : e,
                deltaX = point.pageX - el.movement.pointX,
                deltaY = point.pageY - el.movement.pointY,
                absDistX = Math.abs(deltaX),
                absDistY = Math.abs(deltaY),
                newX;
                
                if (!el.movement.directionLock) {
                    el.movement.distanceX = el.movement.distanceX + absDistX;
                    el.movement.distanceY = el.movement.distanceY + absDistY;

                    if (el.movement.distanceY > 16) {
                        el.movement.initiated = false;
                        el.movement.distanceY = 0;
                    } else if (el.movement.distanceX > 3) {
                        el.movement.directionLock = true;
                        el.movement.bClick = false;
                    }
                }

                if (el.movement.directionLock) {             
                    el.movement.pointX = point.pageX;
                    newX = el.movement.x - deltaX;
                    slideshowContainer.style.transition = 'all 0s ease 0s';
                    slideshowContainer.style.transform = "translate3d(" + -newX + "px, 0, 0)";
                    el.movement.x = newX;
                }
            }
        },
        moveEnd: function(el, e) {
            if (el.movement && el.movement.initiated) {
                
                var slideshowContainer = el.querySelector('.reggie-slider-inner'),
                    clientX = (e.changedTouches) ? e.changedTouches[0].clientX : e.clientX;            

                if(el.hasAttribute('data-columns')) {
                    slideshowContainer.style.transition = 'all 1.5s ease 0s';
                } else {
                    slideshowContainer.style.transition = 'all 0.25s ease 0s';
                }
                
                if (clientX > el.movement.startX) {
                    if ((clientX - el.movement.startX) > 30) {
                        me.sliderApp.previousSlide(el);
                    } else {
                        utilities.setTranslate(el, this.currentPosition(el));
                    }
                } else {
                    if ((el.movement.startX - clientX) > 30) {
                        me.sliderApp.nextSlide(el);
                    } else {
                        utilities.setTranslate(el, this.currentPosition(el));
                    }
                }
            
                el.movement.directionLock = false;
                el.movement.initiated = false;
                el.movement.distanceX = 0;

                setTimeout(function() {
                    el.movement.bClick = true;
                }, 300);
            }
        }
    };

    // initiate slider
    if (document.readyState == 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            me.sliderApp.init();
        });
    } else {
        me.sliderApp.init();
    }

})(document, __reggie);
