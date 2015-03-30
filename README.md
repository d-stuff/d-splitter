# d-splitter #
==================

an angular directive to split the screen.
I really want to thank angular-sweetalert for this package-layout!

## Requirements ##

- [jquery][jquery-url]
- [angular][angular-url]

## Install ##

```powershell
bower install d-splitter
```

## Import ##

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>DEMO</title>
    <link rel="stylesheet" type="text/css" href="libs/d-splitter.css">
</head>
<body>
    <script type="text/javascript" src="libs/jquery.min.js"></script>
    <script type="text/javascript" src="libs/angular.min.js"></script>
    <script type="text/javascript" src="libs/d-splitter.min.js"></script>
    <d-splitter [type="v"/"h"] [refer-el="1"/"2"] [collapse-el="1"/"2"] [size="100"/"30%"]>
        <ANY></ANY>
        <ANY></ANY>
    </d-splitter>
</body>
</html>
```

## Usage ##

```javascript

var demo = angular.module('demo', ['dSplitter']);

```

the directive can be used without any of the attributes:
the defualts are:
- type: "h" (for "horizontal") - can be also "v".
- refer-el: 1 (as for the first element) - can be 1 or 2, to specify the elemnt you referred as the main-screen.
- collapse-el: 2 (as for for the second element) - can be 1 or 2, to specify which one of the children-element will be collapsed by double-clicking the splitter-bar (default is the opposite to the referred-element)
- size: 50% (give the referred-element 50% from the possible dimensions) - can be number (to define pixels) or with as presentage (like "40%") to define the starting-size of the referred-element.
- min: null - can define a minimum size for the referred-element, so it can't be resized to be smaller (if so - will become collapsed)
- max: null - can define a maximum size for the reffered-element, so it can't be resized to be bigger.

```html
<d-splitter>
    <ANY></ANY>
    <ANY></ANY>
</d-splitter>
```

it's important for you to know, the attributes: 'size', 'min' and 'max' can be also be taken form CSS declarations, which means:
if you have "width: 100px" or "height: 100%" on the referred-element itself, or on a css file, the directive will consider it as it's starting-size.
the same goes for: min-height, min-width, max-height, max-width.
notice: declaring "50%" size as a starting-size for the first element, takes in considations the size of the splitter-bar, the splitter-borders etc, so it will be the same size as the second element.Import

also, if you try to define your own style to the splitter (borders, splitter-bar etc.), the splitter should work fine and consider your CSS declarations while calculating dimensions.
and it's also work fine with resize, and recursively.


it took me two days to make it, so if you want to help making it more clear, and rewrite this doc, it's great!

## LICENSE ##

[MIT License](https://raw.githubusercontent.com/leftstick/angular-sweetalert/master/LICENSE)

[angular-url]: https://angularjs.org/
[jquery-url]: https://jquery.com/