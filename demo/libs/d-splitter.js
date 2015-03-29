/**
 * d-splitter is a simple splitter for angular
 *
 * @author d-stuff
 * @date   Mar 29th, 2015
 *
 **/
(function(angular) {
    'use strict';
    
    angular.module('dSplitter', []).directive('dSplitter', [
        '$compile',
        '$timeout', 
        '$window',
        '$document',
    function ($compile, $timeout, $window, $document) {
        
    $window = $($window);
    $document = $($document)
 
    var eventsPrefix = ".dSplitter",
        COLLAPSE_MIN_SIZE = 30;
 
    function SplitterException(message, opts) {
        this.message = message;
        this.scope = opts.scope;
        this.el = opts.el;
    }
    
    function getElDimensions(el) {
        return {
            width: el.width(),
            height: el.height()
        };
    }
 
    function defineSizes($splitter, $children, referIndex, $bar, referDimension, disableTrigger) {
 
        var triggerCollapse = 0;
 
        referDimension = angular.copy(referDimension);
        var splitterDimensions = getElDimensions($splitter),
            barDimensions = {
                size: $splitter.data('isHorizontal') ? $bar.outerHeight() : $bar.outerWidth()
            };
        splitterDimensions.size = $splitter.data('isHorizontal') ? splitterDimensions.height : splitterDimensions.width;
        referDimension.size = ("" + referDimension.size).slice(-1) === "%" ? ((splitterDimensions.size * parseInt(referDimension.size) / 100) - (barDimensions.size * 0.5)) : referDimension.size;
 
        if (referDimension.size < 0) {
            referDimension.size += (splitterDimensions.size - barDimensions.size);
        }
 
        // makes sure the element is between its limits
        referDimension.size = Math.min(Math.max(referDimension.size, (referDimension.min || 0)), (referDimension.max || referDimension.size), (splitterDimensions.size - barDimensions.size));
 
        var referCss = {};
        var siblingCss = {};
        var barCss = {};
        if ($splitter.data('isHorizontal')) {
            //the obvious dimensions first
            siblingCss.left = referCss.left = siblingCss.right = referCss.right = 0;
            siblingCss[referIndex ? "top" : "bottom"] = referCss[referIndex ? "bottom" : "top"] = 0;
 
            // the hard-to-calculate dimensions
            referCss.height = referDimension.size;
            siblingCss.height = splitterDimensions.height - referCss.height - barDimensions.size;
 
            // the bar position
            barCss[referIndex ? "bottom" : "top"] = referCss.height;
            barCss.height = barDimensions.size;
 
            // check if calculation is small, and collapse the smaller pane
            if (Math.min(referCss.height, siblingCss.height) <= COLLAPSE_MIN_SIZE) {
                triggerCollapse = ((referCss.height < siblingCss.height) ? referIndex : (referIndex ? 0 : 1)) + 1;
            }
        } else {
            //the obvious dimensions first
            siblingCss.top = referCss.top = siblingCss.bottom = referCss.bottom = 0;
            siblingCss[referIndex ? "left" : "right"] = referCss[referIndex ? "right" : "left"] = 0;
 
            // the hard-to-calculate dimensions
            referCss.width = referDimension.size;
            siblingCss.width = splitterDimensions.width - referCss.width - barDimensions.size;
 
            // the bar position
            barCss[referIndex ? "right" : "left"] = referCss.width;
            barCss.width = barDimensions.size;
 
            // check if calculation is small, and collapse the smaller pane
            if (Math.min(referCss.width, siblingCss.width) <= COLLAPSE_MIN_SIZE) {
                triggerCollapse = ((referCss.width < siblingCss.width) ? referIndex : (referIndex ? 0 : 1)) + 1;
            }
        }
 
        $children.eq(referIndex).css(referCss); // put the css on the referredIndex
        $children.eq(referIndex ? 0 : 1).css(siblingCss); // put the sibling's css on the referred sibling
        $bar.css(barCss);
 
        if (!disableTrigger)
            $window.resize();
 
        return triggerCollapse;
    }
 
    function isValidPosition($splitter, referIndex, $bar, barPosition, referChildDimensions) {
        var splitterDimensions = {
                width: $splitter.width(),
                height: $splitter.height()
            },
            referFutureSize;
 
 
        if ($splitter.data('isHorizontal')) {
            splitterDimensions.size = splitterDimensions.height;
            referFutureSize = referIndex ? (splitterDimensions.size - barPosition - $bar.outerHeight()) : barPosition;
        } else {
            splitterDimensions.size = splitterDimensions.width;
            referFutureSize = referIndex ? (splitterDimensions.size - barPosition - $bar.outerWidth()) : barPosition;
        }
 
        return (referFutureSize >= referChildDimensions.min && referFutureSize <= (referChildDimensions.max || splitterDimensions.size)) ? referFutureSize : false;
    }
 
    return {
        restrict: "E",
        compile: function compile(elem) {
            var prevDom = elem.html();
            elem.html("");
 
            return {
                pre: function () {
                    //elem.html(prevDom);
                },
                post: function post(scope, element, attrs) {
                    element
                    .html(prevDom)
                    .data('isHorizontal', attrs.type === 'h');
 
                    var defineProperty = element.data('isHorizontal') ? "Height" : "Width",
                        $children = element.children().addClass(element.data('isHorizontal') ? "horizontal" : "vertical"),
                        referEl = attrs.referEl === "2" ? 1 : 0,
                        collapseEl = attrs.collapseEl ? (attrs.collapseEl - 1) : (referEl ? 0 : 1),
                        isCollapsed = false,
                        isDblClick = false;
 
                    if ($children.length !== 2) {
                        throw new SplitterException("should be exactly 2 children to the splitter!", {el: element});
                    }
 
                    // the child element that define the dimensions inside the splitter
                    var $referChild = $children.eq(referEl),
                        referChildDimensions = {
                            size: (attrs.size || $referChild[defineProperty.toLowerCase()]() || "50%"),
                            min: parseInt("0" + (attrs.min || $referChild.css("min-" + defineProperty.toLowerCase()) || 0), 10),
                            max: parseInt("0" + (attrs.max || $referChild.css("max-" + defineProperty.toLowerCase())), 10)
                        },
                        collapsedDimensions = {min: 0};
 
                    $referChild.addClass("referred");
                    $children.css("max-" + defineProperty.toLowerCase(), "none")
                        .css("min-" + defineProperty.toLowerCase(), "0");
 
                    function collapse(index, stopTrigger) {
                        $children.removeClass("collapsed");
                        isCollapsed = true;
 
                        var $el = $children.eq(index).addClass("collapsed");
                        var btn = $el.children(".collapse-button");
                        collapsedDimensions.size = (index === referEl) ? btn["outer" + defineProperty]() : (0 - btn["outer" + defineProperty]());
 
                        defineSizes(element, $children, referEl, $splitterBar, collapsedDimensions, stopTrigger);
                    }
 
                    // the splitter bar
                    var $splitterBar = $("<div />").addClass("splitter-bar")
                        .addClass(element.data('isHorizontal') ? "horizontal" : "vertical")
                        .insertAfter($children.eq(0))
                        .on("mousedown" + eventsPrefix, function () {
 
                            var prevCollapse = isCollapsed;
                            isCollapsed = false;
                            $children.removeClass("collapsed");
 
                            var $screen = $("<div />").addClass("screen").appendTo(element);;
 
                            var $barClone = $splitterBar.clone().addClass("clone"),
                                propName = element.data('isHorizontal') ? "top" : "left",
                                propValue = element.data('isHorizontal') ? "pageY" : "pageX",
                                $splitters = $("d-splitter"),
                                $body = $("body").css("cursor", element.data('isHorizontal') ? "s-resize" : "e-resize");
                            $splitterBar.after($barClone);
 
                            angular.forEach([$splitters, $children, $body, $splitterBar], function (el) {
                                el.addClass("unselectable")
                                    .attr("unselectable", "on");
                            });
 
                            var prevSize = referChildDimensions.size;
 
                            function abortResize() {
                                referChildDimensions.size = prevSize;
                                closeEvents();
                            }
 
                            function applyResize() {
                                $timeout(function () {
                                    if (isDblClick) {
                                        return isDblClick = false;
                                    }
                                    closeEvents();
                                    defineSizes(element, $children, referEl, $splitterBar, referChildDimensions);
                                }, 100);
                            }
 
                            function closeEvents(hard) {
                                (hard ? element.children(".splitter-bar.clone") : $barClone).remove();
                                element.off("mousemove" + eventsPrefix)
                                    .off("mouseup" + eventsPrefix)
                                    .off("mousedown" + eventsPrefix);
 
 
                                $document.off("mouseup" + eventsPrefix)
                                    .off("mouseout" + eventsPrefix);
 
                                $timeout(function () {
                                    angular.forEach([$splitters, $children, $body, $splitterBar], function (el) {
                                        el.removeClass("unselectable")
                                            .removeAttr("unselectable");
                                    });
                                    $screen.remove();
                                }, 500);
 
                                $body.css("cursor", "auto");
                            }
 
                            element.on("mousemove" + eventsPrefix, function (event) {
                                var mousePos = event[propValue] - element.offset()[propName];
                                var size = isValidPosition(element, referEl, $barClone, mousePos, referChildDimensions);
 
                                if (size) {
                                    $barClone.css(propName, mousePos).removeClass("error");
                                    referChildDimensions.size = size;
                                    return true;
                                }
                                $barClone.addClass("error");
                            })
                                .on("mouseup" + eventsPrefix, applyResize);
 
                            // handle double-click situation
                            $timeout(function () {
                                element.on("mousedown" + eventsPrefix, function () {
                                    isDblClick = true;
 
                                    $children.removeClass("collapsed");
                                    isCollapsed = !prevCollapse;
 
                                    if (isCollapsed) {
                                        var $el = $children.eq(collapseEl).addClass("collapsed");
                                        var btn = $el.children(".collapse-button");
                                        collapsedDimensions.size = (collapseEl === referEl) ? btn["outer" + defineProperty]() : (0 - btn["outer" + defineProperty]());
                                    }
 
                                    closeEvents(true);
                                    defineSizes(element, $children, referEl, $splitterBar, isCollapsed ? collapsedDimensions : referChildDimensions);
                                });
                            });
 
                            $document.on("mouseup" + eventsPrefix, applyResize)
                                .on("mouseout" + eventsPrefix, function (e) {
                                    e = e ? e : window.event;
                                    var from = e.relatedTarget || e.toElement;
                                    if (!from || from.nodeName == "HTML") {
                                        applyResize();
                                    }
                                });
                        });
 
                    //collapse Buttons
                    angular.forEach($children, function (el) {
                        var $el = $(el);
                        if ($el.is("[splitter-collapse=false]")) {
                            return;
                        }
 
                        var isReffered = $el.is($referChild);
                        var prop = "outer" + defineProperty;
                        $("<button />").addClass("collapse-button")
                            .on("click" + eventsPrefix, function () {
 
                                isCollapsed = !($el.is(".collapsed") && isCollapsed);
                                $children.removeClass("collapsed");
 
                                if (isCollapsed) {
                                    $el.addClass("collapsed");
                                    collapsedDimensions.size = isReffered ? $(this)[prop]() : (0 - $(this)[prop]());
                                }
 
                                defineSizes(element, $children, referEl, $splitterBar, isCollapsed ? collapsedDimensions : referChildDimensions);
                            }).prependTo(el);
                    });
 
                    var collapsed = defineSizes(element, $children, referEl, $splitterBar, isCollapsed ? collapsedDimensions : referChildDimensions);
                    if (collapsed) {
                        collapse(collapsed - 1);
                    }
                    $children.addClass("splitter-pane");
 
                    $window.resize(function () {
                        var collapsed = defineSizes(element, $children, referEl, $splitterBar, isCollapsed ? collapsedDimensions : referChildDimensions, true);
                        if (collapsed) {
                            collapse(collapsed - 1, true);
                        }
                    });
 
                    // compile the inside content. makes sure that parent splitter rendered before it's children
                    $compile(element.contents())(scope);
                }
            }
        }
    };
}]);
    
    

}(angular));
