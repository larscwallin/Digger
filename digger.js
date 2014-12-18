window.Digger = function(rootSelector, options){
    var sourceListElement;
    var navHistory = [];
    var currentLevel = null;
    var transitionHandler = null;
    var listRootTagName = 'ul';
    var listItemTagName = 'li';
    var diggerWidgetPanel = null;
    var $ = window.$;
    var jQuery = window.jQuery;
    var context = window;
    var readyState = false;

    function transitionIn(from, to, cb){  

            $(from).css('display', 'none');                    
            $(to).appendTo('.digger-panel-content');
            $(to).css('display', 'inherit');            

            if(cb instanceof Function){
                cb();
            }

    }

    function transitionOut(from, to, cb){

        $(from).appendTo(to);
        $(to).find(('>' + listRootTagName)).css('display', 'none');
        $(to.parentElement).css('display', 'inherit');

        if(cb instanceof Function){
            cb();
        }

    }

    function getCurrentLevel(){
        return navHistory.length;
    }
    
    function goUp (level){
        level = level !== null ? level : 0;
        var current;
        var nextParentLevel;

        var previous = navHistory.pop();

        if(previous === undefined) {return;}

        transitionOut(currentLevel, previous.element, function(){
            previous.element.removeAttribute('data-active');
            currentLevel = previous.element.parentElement;

        });
        
        current = getCurrentLevel();

        if(current < 1){
            $(diggerWidgetPanel).addClass('digger-level-root');
            $('.digger-panel-header-title').text('');
        }else{
            nextParentLevel = navHistory[current - 1];
            $('.digger-panel-header-title').text(nextParentLevel.title);
        }

        if(level - 1 > 0){
            goUp(level);

        }
    }

    function goDown (targetEl){        
        var list;
        var parentText;

        if(typeof targetEl !== 'string'){
            if(targetEl instanceof jQuery.Event || targetEl instanceof context.Event){
                targetEl = targetEl.currentTarget.parentElement;
            } else {

            }
        }else{
            // If the targetEl argument was a string we assume it is a CSS selector. 
            targetEl = $(targetEl)[0];
        }
        
        // Check if the targetEl is a list.
        if(targetEl.childElementCount > 0){
            
            if(targetEl.tagName.toLowerCase() === listItemTagName){
                list = $(targetEl).find('>' + listRootTagName);
            }else{
                list = $(targetEl);
            }
            if(list.length >0 && targetEl.getAttribute('data-active') === null){

                // Set the global currentLevel variable.
                currentLevel = list;

                targetEl.setAttribute('data-active', 'true');

                parentText = targetEl.innerText;

                $('.digger-panel-header-title').text(parentText);

                navHistory.push({'title':parentText, 'element':targetEl});

                transitionIn(targetEl.parentElement, list);


            }else{

            }

        }else{
            
        }
        
        // If we are not at the top / root of the list we remove the meta class '.digger-level-root'
        if(getCurrentLevel() > 0){            
            $(diggerWidgetPanel).removeClass('digger-level-root');
        }
        
    }
    
    function drillDown(targetSelector) {
        var targetElement = $(targetSelector)[0];
        var item;
        var list = [];

        if(targetElement){
            
            // We want an listItem tag as target so if the targetSelector points to a rootType re-reference the targetElement
            // to its parent.
            if(targetElement.tagName.toLowerCase() === listRootTagName){
                targetElement = targetElement.parentElement;
                
                if(targetElement.tagName.toLowerCase() !== listItemTagName){
                    return false;
                }
                
            }else{
            
            }
            
            item = climb(targetElement, list);
            // The resulting list includes the very top root element which we dont want so we pop it of the stack.
            list.pop();
            // The list is "bottoms up" which is the oposite of what we want so we reverse it.
            list.reverse();
            
            list.forEach(function(item){
                // Each item in the list returned by the climb function is of listRootTagName type. goDown on the other hand
                // wants a specific listItemTagName type so we re-reference the item its wrapping parent element.
                goDown(item.parentElement);
            });

        }else{
            return false;
        }
    }
    
    function climb(el, list){
        var item = el.parentElement;
        
        if(el === item){
            return el;
        }
        
        if(item.tagName.toLowerCase() !== listRootTagName && item.tagName.toLowerCase() !== listItemTagName){
            return false;
        }
        
        if(item.tagName.toLowerCase() === listItemTagName){
            item = item.parentElement;
        }
        
        list.push(item);
        
        if($(item).is(rootSelector)){
            return item;
        }else{
           return climb(item, list);
        }
    }

    function prospect(searchFor){
        // Take the selector and go through all list levels, including all attributes and nested elements.
        // Use CSS matching selectors and jquery 'whateverTagName:contains("whatever string")'
        // Return a list of all matching elements.
    }
    
    function setupClassNames(cb){
        $(sourceListElement).parent().find(listRootTagName).addClass('digger-box digger-list');
        $(sourceListElement).find(listItemTagName).addClass('digger-list-item');
        $(sourceListElement).addClass('digger-list-root');          
        $(listRootTagName + ('.digger-box * ' + listRootTagName)).css('display', 'none');

        cb();
    }

    function setupNavigationLinks(cb){
        
        $(sourceListElement).find(listItemTagName).each(function(){
            var link;
            if($(this).find(listRootTagName).length > 0){
                this.setAttribute('style', 'position:relative;');                              
                link = context.document.createElement('a');
                link.setAttribute('class', 'digger-link-down');
                this.appendChild(link);
            }else{

            }
        });
        cb();
    }

    function setupElements(cb){
        var listItemIndex = 0;
        var diggerBackLink = null;
        var diggerHeader = null;
        var diggerFooter = null;
        var diggerHeaderTitle = null;

        // Create the Digger header back link and add it to the header.
        diggerHeader = context.document.createElement('div');
        $(diggerHeader).addClass('digger-panel-header');

        // Create the Digger header back link and add it to the header.
        diggerBackLink = context.document.createElement('div');
        $(diggerBackLink).addClass('digger-link-up');
        $(diggerBackLink).prependTo(diggerHeader);

        // Create the Digger header title and add it to its parent.
        diggerHeaderTitle = context.document.createElement('div');
        $(diggerHeaderTitle).addClass('digger-panel-header-title');
        $(diggerHeaderTitle).appendTo(diggerHeader);

        // Create the Digger content element and add it to the Widget panel.
        diggerFooter = context.document.createElement('div');
        $(diggerFooter).addClass('digger-panel-footer');

        $(sourceListElement).wrap('<div class="digger-panel-content"></div>');

        $('.digger-panel-content').wrap('<div class="digger-panel-widget digger-level-root"></div>');


        // Add the header to the main Widget panel
        $(diggerHeader).prependTo('.digger-panel-widget');

        $(diggerFooter).appendTo('.digger-panel-widget');

        // Set up unique ids for each list

        $(sourceListElement).find(listRootTagName).each(function(){
            $(this).attr('data-digger-id', ('list-' + listItemIndex++));
        });

        // Set up unique ids for each list-item

        $(sourceListElement).find(listItemTagName).each(function(){
            $(this).attr('data-digger-id', ('item-' + listItemIndex++));
        });        
        
        diggerWidgetPanel = $('.digger-panel-widget');
        
        cb();
    }

    function attachElementHanders(cb){
        $(sourceListElement).find('.digger-link-down').on('click', goDown);
        $('.digger-panel-widget').find('.digger-link-up').on('click', goUp);

        cb();
    }

    function removeElementHanders(cb){
        $(sourceListElement).find('.digger-link-down').up('click', this.goDown);
        $('.digger-panel-widget').find('.digger-link-up').off('click', goUp);
        cb();
    }


    function setup(cb){

        setupElements(function(){
            setupClassNames(function(){
                setupNavigationLinks(function(){
                    attachElementHanders(function(){
                        cb();
                    });

                });    
            });
        });

    }  

    function init(){

        sourceListElement = $(rootSelector)[0];
        
        if(sourceListElement === undefined){
            return false;
        }
        
        if(options !== undefined){
            listRootTagName = options.listRootTagName !== undefined ? options.listRootTagName : 'ul';                
            listItemTagName = options.listItemTagName !== undefined ? options.listItemTagName : 'li';                                
        }
        if(sourceListElement !== null && sourceListElement.tagName.toLowerCase() === listRootTagName){

            setup(function(){
              readyState = true;
            });

        }else{

        }
    }

    init();
    
    return {
        'goUp': goUp,
        'goDown': goDown,
        'drillDown': drillDown,
        'getCurrentLevel': getCurrentLevel,
        'ready': readyState
    };


};
