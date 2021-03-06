// Global Variables
var selected;

// Message Retrieval
var getMessages = function(){
	var message = function(data){
		// console.log(data);
		if(data !== "OK") {
			$('.badge.message').text('!');
			$('.message').data('bs.popover').options.content = '<i class="fa fa-comment-o fa-2x pull-right"></i><br />' + data;
			// console.log('Message Received');
		}
	};
	$.ajax({
		method	: 'POST',
		url 	: '/sms/get',
		success : message
	});
}

// Save page state with the user in the databaase
var pageState = function(){
	// console.log("I be savin' data!");
	var pageSave = $('.save-container').html();
	$.ajax({
		method 	: 'POST',
		url		: '/db',
		data	: {data : pageSave}
	});
};

var loadPage = function(data){
	if(data){
		$('.save-container').html(data);
	}
};

var loadSortable = function(){
	$("tbody#sortableProject").sortable({
		connectWith : "tbody#sortableProject",
		cursor : "move"
	});
	$("tbody#sortableTask").sortable({
		connectWith : "tbody#sortableTask",
		cursor: "move"
	});
}

var pageRetrieve = function(){
	// console.log('Loading Saved Data');
	$.ajax({
		method 	: 'GET',
		url   	: '/db',
		success : loadPage,
		complete: loadSortable
	});
};

var clientList = [];
var storedClientList = [{
	name : "RefactorU",
	logoPath : "img/logo.png"
},
{
	name : "Amazon",
	logoPath : "img/amazon.png"
},
{
	name : "Klein Tools",
	logoPath : "img/klein.png"
},
{
	name : "Western Nephrology",
	logoPath : "img/western.png"
}];

$(document).on('ready', function() {

	// Load localStorage if it exist - Otherwise load dummy data
	if (localStorage.getItem('clients') === null ) {
		localStorage['clients'] = JSON.stringify(storedClientList);
		console.log("Default Client List Loaded");
	}

	clientList = JSON.parse(localStorage["clients"]);
	
	pageRetrieve();
	// $('.badge.urgent').text(2);

	var workingProject;
	var workingTask;

	// Initialize Page Widgets
	$('.message').popover({
		container : 'body',
		content : 'Waiting...'
	});
	$('.urgent').popover({
		container : 'body',
		// content : '<p><strong>Overdue</strong> - Final Project</p><p><strong>Behind</strong> - Final Project</p>'
	});
	$('#fromDate').datepicker();
	$('#toDate').datepicker({defaultDate: "+1w"});

	$('.modal-body.notes').notebook({
		autoFocus : false,
		placeholder : 'Your text here...',
		mode : 'multiline', // // multiline or inline
		modifiers : ['bold', 'italic', 'underline', 'h1', 'h2', 'ol', 'ul', 'anchor']
	});
	
	// Message Retrieval System
	getMessages();
	setInterval(function(){
		getMessages();
	}, 20000)

	// Re-Calculate Task Progress Once Saved Page Load is Complete
	$(document).ajaxComplete(function(){
		$('p.date-range').each(function(index){
			if($(this).text() !== "Date") {
				var fromString = $(this).text().slice(0, 10);
				var toString = $(this).text().slice(14, 25);
				var currentPercentComplete = $(this).parent().find('.progress-bar-success').text()
				var newPlannedTotal = new Date(toString) - new Date(fromString);
				var newelapsedTime = new Date() - new Date(fromString);
				var newPlannedComplete = (newelapsedTime / newPlannedTotal) * 100;
				
				if (newPlannedComplete > 100) {
					var calcOver = newPlannedComplete - 100;
					$(this).parent().find('.progress-bar-danger').width((newPlannedComplete - currentPercentComplete - calcOver) + '%').text(newPlannedComplete);			
				}
				else {
					$(this).parent().find('.progress-bar-danger').width((newPlannedComplete - currentPercentComplete) + '%').text(newPlannedComplete);			
				}
				$(this).parent().find('.progress-bar-success').width(currentPercentComplete + '%');
			}	
		});
	});

	// Top Nav Bar Click Events
	$('ul.navbar-nav li').on('click', function(){
		if ($(this).hasClass('active')) {
			$(this).removeClass('active');
			// Sidebar Hamburger - Deactivate other Top Nav Elements and Hide Sidebar
			if($(this).children('a').hasClass('fa-bars')) {
				$('.navbar-right').children('li.active').removeClass('active');
				$('.sidebar-menu .container-fluid').fadeOut(100);
				$('.sidebar-menu').animate({width: '0%'});
				$('.main-content').animate({width: '90%', marginLeft: '5%'}, function(){
					// pageState();
				});
			}
		}
		else {
			$(this).addClass('active');
			if ($(this).children('a').hasClass('fa-envelope-o') || $(this).children('a').hasClass('fa-tasks')) {
				$(this).removeClass('active');
			}
			$(this).children('.fa-envelope-o').popover('show');
			$(this).children('.fa-tasks').popover('show');
			$(this).children('.fa-envelope-o').children('.badge').text('');
			$(this).children('.fa-tasks').children('.badge').text('');
			$(this).siblings('li.active').removeClass('active');
			// Sidebar Hamburger - Deavtivate other Top Nav Elements and Show Sidebar
			if($(this).children('a').hasClass('fa-bars')) {
				$('.navbar-right').children('li.active').removeClass('active');
				$('.sidebar-menu').animate({width: '15%'}, function(){
					$('.sidebar-menu .container-fluid').fadeIn().animate({opacity: 1}, 200, function(){
						// pageState();
					});
				});
				$('.main-content').animate({width: '75%', marginLeft: '20%'});
			}
		}
	});

	// Sidebar Click Events
	$('.sidebar-menu li').on('click', function(){
		// Handle Sidebar accordions
		if ($(this).hasClass('active')) {
			$(this).removeClass('active').children('p').slideUp();
			$(this).find('.caret').removeClass('caret').addClass('caret-right');

		}
		else	{
			$(this).addClass('active').children('p').slideDown();
			$(this).siblings().removeClass('active').children('p').slideUp();
			$(this).siblings().find('.caret').removeClass('caret').addClass('caret-right');
			$(this).find('.caret-right').removeClass('caret-right').addClass('caret');
		}

		// setTimeout(pageState, 1000);
	});

	$('.sidebar-menu li > p').on('click', function(event){
		// Handle menu items
		event.stopPropagation();
		if ($(this).hasClass('add') && $(this).text() === 'Add New Project') {
			$('table.tasks.active').toggleClass('active').fadeToggle();

				$('select').empty();

				for (var i = 0; i < clientList.length; i++) {
						$('select').append('<option>' + clientList[i].name + '</option>');
				};

			$('#projectEntryModal').modal();
		}
		else if ($(this).hasClass('add') && $(this).text() === 'Add New Client') {
			$('table.tasks.active').toggleClass('active').fadeToggle();
			$('#clientEntryModal').modal();
		}
		else if ($(this).hasClass('restore') && $(this).text() === 'Restore Last Deleted Project') {
			$(this).fadeOut(400, function(){
				$(this).addClass('hidden');
			});
			$('tr.project.hidden').removeClass('hidden').fadeIn();
			setTimeout(pageState, 1000);
		}
		else if ($(this).hasClass('restore') && $(this).text() === 'Restore Last Deleted Task') {
			$(this).fadeOut(400, function(){
				$(this).addClass('hidden');
				$(this).closest('.active').removeClass('active');
			});
			$('tr.task.hidden').removeClass('hidden').fadeIn();

			setTimeout(pageState, 1000);
		}
	});

	// Project Click Events - Delegated to save-container div
	$('.save-container').on('click', 'table.projects tr.project', function(){
		var selectedProjectTasks = $(this).find('table.tasks');
		var activeProjectTasks = $(this).siblings('tr').find('table.tasks.active');
		
		if (selectedProjectTasks.hasClass('active')) {
			selectedProjectTasks.removeClass('active').fadeOut().animate({opacity : 0}, function(){
				pageState();
			});
		}
		else {
			selectedProjectTasks.addClass('active').fadeIn().animate({opacity : 1}, function(){
				pageState();
			});
			activeProjectTasks.removeClass('active').fadeOut()
		}
	});

	// Project Button Clicks
	$('.save-container').on('click', 'table.projects tr.project > td > .btn', function( event ){

		event.stopPropagation();

		workingProject = $(this).closest('tr.project');
		
		if ($(this).text() === 'Add Task') {
			
			if (! workingProject.find('table.tasks').hasClass('active')) {
				workingProject.find('table.tasks').addClass('active');
			}

			$('#taskEntryModal').modal();
			workingProject.find('table.tasks').fadeIn();
		}
		else {
			$(this).closest('tr.project').fadeOut(400, function(){
				$(this).addClass('hidden');
				$(this).siblings('.hidden').remove();

				if ($('.sidebar-menu .restore.hidden.prj').parent().hasClass('active')) {
					$('.sidebar-menu .restore.hidden.prj').fadeIn().removeClass('hidden');
				}
				else {
					$('.sidebar-menu .restore.hidden.prj').removeClass('hidden').css('display', 'none');
				}
				setTimeout(pageState, 1000);
			});
		}
	});

	// Task Click Events
	$('.save-container').on('click', 'table.tasks tr', function(event){
		var taskName = $(this).find('h4').first().text();
		var taskDesc = $(this).find('h4').first().siblings('h4').text();
		event.stopPropagation();

		// Assign to Global variable "selected"
		selected = $(this);

		$('#modalName').text(taskName);
		$('#modalDesc').html('<small><em>' + taskDesc + '</em></small>');
		$('#taskDetailModal').modal();
		if ($(this).find('.notes-container').children().length !== 0){
			$(this).find('.notes-container').children().appendTo('.modal-body.notes');
		};

	});

	// Task Detail Modal Events
	$('#taskDetailModal .btn-default').on('click', function(){
		var selectedTask = selected;

		selectedTask.find('.notes-container').append($('.modal-body.notes').html());
		$('.modal-body.notes').empty();

		setTimeout(pageState, 1000);
	});

	$('#taskDetailModal .btn-primary').on('click', function(){
		var percentComplete = $('#percentComplete').val();
		// Assign the task that triggered this modal
		var selectedTask = selected;
		var plannedPercentComplete = parseFloat($(selectedTask).find('.progress-bar-danger').text());

		// Populate Task Percentage Complete Progress
		if(percentComplete > plannedPercentComplete) {
			// console.log('Ahead of Schedule');
			// console.log(percentComplete + ' is greater than ' + plannedPercentComplete);
			$(selectedTask).find('.progress-bar-success').width(percentComplete + '%').text(percentComplete);
			$(selectedTask).find('.progress-bar-danger').width('0');
		}
		else {
			// console.log('Behind Schedule');
			if (!percentComplete) {
				percentComplete = ($(selectedTask).find('.progress-bar-success').width() / $(selectedTask).find('.progress').width()) * 100;
			}
			if (plannedPercentComplete > 100){
				var overage = plannedPercentComplete - 100;
				// console.log(overage)
				$(selectedTask).find('.progress-bar-danger').width((plannedPercentComplete - percentComplete - overage) + '%');
			}
			else {
				$(selectedTask).find('.progress-bar-danger').width((plannedPercentComplete - percentComplete) + '%');
			}
			$(selectedTask).find('.progress-bar-success').width(percentComplete + '%').text(percentComplete);
		}
		selectedTask.find('.notes-container').append($('.modal-body.notes').html());

		// Close Modal and Clear Form Data
		$('#taskDetailModal').modal('toggle');
		$('#percentComplete').val('');
		$('.modal-body.notes').empty();
		// Save New Page State
		setTimeout(pageState, 1000);
	});

	// Task Button Click Events
	$('.save-container').on('click', 'table.tasks .btn', function(event){

		event.stopPropagation();

		workingTask = $(this).closest('tr.task');

		$(this).closest('tr.task').fadeOut(400, function(){
			$(this).addClass('hidden');
			$(this).siblings('.hidden').remove();

			if ($('.sidebar-menu .restore.hidden.tsk').parent().hasClass('active')) {
				$('.sidebar-menu .restore.hidden.tsk').fadeIn().removeClass('hidden');
			}
			else {
				$('.sidebar-menu .restore.hidden.tsk').removeClass('hidden').css('display', 'none');
			}
			setTimeout(pageState, 1000);
		});
	});

	// Form Click Events
	// Project Entry Form
	$('#projectEntryModal .modal-footer .btn-primary').on('click', function(){
		var projectName = $('#projectName').val();
		var projectDesc = $('#projectDescription').val();
		var newProject = $('table.template .project');
		var clientName = $('#clientID :selected').text();
		var clientImg = clientList.map(function(key) { return key.name }).indexOf(clientName);

		// Populate Project Template
		newProject.find('h2').first().text(projectName);
		newProject.find('em').first().text(projectDesc);

		if (clientList[clientImg].logoPath && clientList[clientImg].logoPath !== ""){
			newProject.find('img').attr("src", clientList[clientImg].logoPath).removeClass('collapse');
			newProject.find('.client').addClass('collapse').empty();
		}
		else {
			newProject.find('img').removeAttr("src").addClass('collapse');
			newProject.find('.client').removeClass('collapse').text(clientName);
		}
		// Add Project Template Clone to Main Table Body
		$('table.projects > tbody').prepend(newProject.clone());
		// Close Modal and Clear Form Data
		$('#projectEntryModal').modal('toggle');
		$('#projectName').val('');
		$('#projectDescription').val('');
		$('#clientName').val('');
		// Save New Page State
		setTimeout(pageState, 1000);
	});

	// Task Entry Form
	$('#taskEntryModal .modal-footer .btn-primary').on('click', function(){
		var taskName = $('#taskName').val();
		var taskDescription = $('#taskDescription').val();
		var newTask = $('table.taskTemplate .task');
		var fromDate = $('#fromDate').val();
		var toDate = $('#toDate').val();
		var totalTime = new Date(toDate) - new Date(fromDate);
		var elapsedTime = new Date() - new Date(fromDate);
		var plannedComplete = (elapsedTime / totalTime) * 100;

		// Populate Current Planned Task Progress
		if (totalTime === 0) {
			$(newTask).find('.progress-bar-danger').width('0%').text('0');
		}
			$(newTask).find('.progress-bar-danger').width(plannedComplete + '%').text(plannedComplete);

		// Populate Task Template
		newTask.find('h4').first().text(taskName);
		newTask.find('em').first().text(taskDescription);
		newTask.find('p.date-range').text(fromDate + ' to ' + toDate);
		// Add Task Template Clone to Project Table Task Space
		workingProject.find('table.tasks tbody').append(newTask.clone());
		// Close Modal and Clear Form Data
		$('#taskEntryModal').modal('toggle');
		$('#taskName').val('');
		$('#taskDescription').val('');
		$('#fromDate').val('');
		$('#toDate').val('');
		// Save New Page State
		setTimeout(pageState, 1000);
		setTimeout(function(){
			$("tbody#sortableTask").sortable({
				connectWith : "tbody#sortableTask",
				cursor : "move"
			});
		}, 2000);
	});

	// Client Entry Form
	$('#clientEntryModal .modal-footer .btn-primary').on('click', function(){
		var clientName = $('#clientEntryModal').find('#clientName').val();
		var clientIcon = $('#clientIcon').val();

		if (clientName !== '') {
			clientList.push({
				name : clientName,
				logoPath : clientIcon
			});
		}

		$('#clientEntryModal').modal('toggle');
		localStorage["clients"] = JSON.stringify(clientList);
		$('#clientEntryModal').find('#clientName').val('');
		$('#clientIcon').val('');
	});

	// Animate buttons on hover
	// Project Button Show
	$('.save-container').on('mouseenter', 'tr.project', function(){
		$(this).find('table.tasks').siblings('a.btn').animate({opacity : 1}, 200);
	});

	$('.save-container').on('mouseleave', 'tr.project', function(){
		$(this).find('.btn').animate({opacity : 0}, 200);
	});

	// Task Button Show
	$('.save-container').on('mouseenter', 'tr.task', function(){
		$(this).find('a').animate({opacity : 1}, 200);
	});

	$('.save-container').on('mouseleave', 'tr.task', function(){
		$(this).find('a').animate({opacity : 0}, 200);
	});

	// Logo hover
	$('nav img.logo').on('mouseenter', function(){
		$(this).attr('src', 'img/pd-inv.png');
	});

	$('nav img.logo').on('mouseleave', function(){
		$(this).attr('src', 'img/pd.png');
	});
});