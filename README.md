jquery.styleCheckbox
====================

This is my first release of a light-weight jQuery plugin for styling checkboxes.

The basic usage to initialize the plugin is:

```
$( "input:checkbox" ).styleCheckbox();
```

If you wish to turn it off, use:

```
$( "input:checkbox" ).styleCheckbox( "destroy" );
```

You may also call it on individual elements, you don't have to style all the checkboxes on a page.

The plugin accepts optional settings:

```
$( "input:checkbox" ).styleCheckbox({
	replacementClass: "styled-checkbox",
	focusClass: "styled-checkbox-focus",
	activeClass: "styled-checkbox-active",
	checkedClass: "styled-checkbox-checked"
});
```

These are the classes applied to the element upon relevant actions. You may also change this, but be sure to change the included styles as well. This feature can also be used to style multiple checkboxes on a page differently.

If you want to change the image used for the replacement, and use different dimensions than the default ones (`16×16px`), you should also edit the `.css` file, or rather, just change the dimensions in the `.scss` file and recompile.

A more complete description will likely be included soon, but this plugin is simple enough that this should be all you need to get you going.

I haven't decided on any specific license yet, but if and when I do, it will certainly be something open sourcey - for now, feel free to use and/or modify this plugin in any way you need, commercial or non-commercial, no attribution needed.

If you notice any bugs, you can report them on the repository's issue tracker.

Cheers!