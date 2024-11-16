document.addEventListener('DOMContentLoaded', function () {
    var calendarEl = document.getElementById('calendar');

    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        editable: true,
        selectable: true,
        events: '/get-events',
        eventDrop: function (info) {
            saveEvent(info.event);
        },
        eventResize: function (info) {
            saveEvent(info.event);
        },
        eventClick: function (info) {
            if (info.event.url) {
                window.open(info.event.url, '_blank');
                info.jsEvent.preventDefault(); // Prevents the browser from following the link in the current tab.
            }
        },
        select: function (info) {
            $('#eventModal').modal('show');
            $('#saveEventButton').off('click').on('click', function () {
                var title = $('#eventTitle').val();
                var startDate = $('#startDate').val();
                var endDate = $('#endDate').val();
                var eventUrl = $('#eventUrl').val();
                var eventImage = $('#eventImage').val();

                if (title && startDate && endDate && eventUrl && eventImage) {
                    var eventData = {
                        title: title,
                        start: startDate,
                        end: endDate,
                        url: eventUrl,
                        extendedProps: {
                            image: eventImage
                        }
                    };
                    calendar.addEvent(eventData);
                    saveEvent(eventData);
                    $('#eventModal').modal('hide');
                }
            });
        },
        eventContent: function (info) {
            let eventEl = document.createElement('div');
            eventEl.classList.add('fc-event-content');

            let titleEl = document.createElement('div');
            titleEl.classList.add('fc-event-title');
            titleEl.innerText = info.event.title;

            eventEl.appendChild(titleEl);

            return { domNodes: [eventEl] };
        }
    });

    calendar.render();

    function saveEvent(event) {
        $.ajax({
            url: '/save-event',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                title: event.title,
                start: event.start,
                end: event.end,
                url: event.url,
                image: event.extendedProps.image, // Ensure image is accessed correctly
                allDay: event.allDay
            }),
            success: function (response) {
                console.log('Event saved successfully');
            },
            error: function (xhr, status, error) {
                console.error('Error saving event:', error);
            }
        });
    }
});
