Digger
======

Simple JQuery based component which turns any hierarchical element structure (UL by default) to a traversable menu. 
Perfect for Responsive side menus etc. where you want to be able to navigate down, or up to a specific level before actually loading the page.

Slightly sketchy code at the moment ;)

API:

* Digger.goDown( element / css-selector )
  This method lets you do down one level from where you currently reside. Argument should be one of the list items currently available at the current level.

* Digger.goUp( )
  At the moment, this method just lets you go back up one step.

* Digger.drillDown( element / css-selector )
  Very handy method which lets you specify a list item to drill down to, at any level in the list.
  This is needed, as an example, when you want to initialize the menu on page load to show the current level in the menu.

  Look at the following example:

      digger = new Digger('#side-nav-panel');
      digger.drillDown('#side-nav-panel li.active:last');  

  This example sets up Digger to do its magic on an UL element with id "side-nav-panel".
  Right after initialization, Digger will drill down to the last li element with the class "active".

* Digger.getCurrentLevel()
  Simply returns on which level in the menu hierarchy you currently are.
