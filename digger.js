window.Digger = function(rootSelector, options){
    var sourceListElement;
    var navHistory = [];
    var currentLevel = null;
    var transitionHandler = null;
    var diggerMainPanel = null;
    var diggerMainPanelBackLink = null;
    var listRootTagName = 'ul';
    var listItemTagName = 'li';

    function transitionIn(from, to, cb){                

            $(from).css('display', 'none');                    
            $(to).appendTo('.digger-panel-main');
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

    function goUp (){

        var previous = navHistory.pop();
        if(previous === undefined) {return;}
        previous = previous.element;

        transitionOut(currentLevel, previous, function(){
            previous.removeAttribute('data-active');
            currentLevel = previous.parentElement;                                
        });

    }

    function goDown (targetEl){        
        var list;
        var parentText;

        if(typeof targetEl !== 'string'){
            if(targetEl instanceof jQuery.Event || targetEl instanceof window.Event){
                targetEl = targetEl.currentTarget.parentElement;
            } else {

            }
        }else{
            // If the targetEl argument was a string we assume it is a CSS selector. 
            targetEl = document.querySelectorAll(targetEl)[0];
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

                navHistory.push({'title':parentText, 'element':targetEl});

                transitionIn(targetEl.parentElement, list);


            }else{

            }

        }else{
            
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
        
        $(sourceListElement).find(listItemTagName).each(function(itemIndex){
            var link;
            if($(this).find(listRootTagName).length > 0){
                this.setAttribute('style', 'position:relative;');                              
                link = document.createElement('a');
                link.setAttribute('class', 'digger-link-down');
                this.appendChild(link);
            }else{

            }
        });
        cb();
    }



    function setupElements(cb){
        var listItemIndex = 0;
        
        diggerMainPanel = document.createElement('div');
        $(diggerMainPanel).addClass('digger-panel-main'); 

        diggerMainPanelBackLink = document.createElement('div');
        $(diggerMainPanelBackLink).addClass('digger-link-up'); 

        $(sourceListElement).wrap(diggerMainPanel);
        $(diggerMainPanelBackLink).prependTo('.digger-panel-main');

        // Set up unique ids for each list
        $(sourceListElement).find(listRootTagName).each(function(){
            $(this).attr('data-digger-id', ('list-' + listItemIndex++));
        });

        // Set up unique ids for each list-item
        $(sourceListElement).find(listItemTagName).each(function(){
            $(this).attr('data-digger-id', ('item-' + listItemIndex++));
        });
                
        cb();
    }

    function attachElementHanders(cb){
        $(sourceListElement).find('.digger-link-down').on('click', goDown);
        $('.digger-panel-main').find('.digger-link-up').on('click', goUp);

        cb();
    }

    function removeElementHanders(cb){
        $(sourceListElement).find('.digger-link-down').up('click', this.goDown);
        $('.digger-panel-main').find('.digger-link-up').off('click', goUp);
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

        sourceListElement = document.querySelector(rootSelector);
        if(options !== undefined){
            listRootTagName = options.listRootTagName !== null ? options.listRootTagName : 'ul';                
            listItemTagName = options.listItemTagName !== null ? options.listItemTagName : 'li';                                
        }
        if(sourceListElement !== null && sourceListElement.tagName.toLowerCase() === listRootTagName){

            setup(function(){
                return true;
            });

        }else{

        }
    }

    init();


    // Export public interface
    return {
        'goUp': goUp,
        'goDown': goDown,
        'drillDown': drillDown
        
    };

};
