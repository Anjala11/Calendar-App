from flask import Flask, render_template, request, redirect, jsonify
from datetime import datetime

import calendar
import json
import sqlite3


# Configure application
app = Flask(__name__)


# Ensure templates are auto-reloaded
app.config["TEMPLATES_AUTO_RELOAD"] = True

# List of months
monthlist = {1: "January", 2: "February", 3: "March", 4: "April", 5: "May", 6: "June", 7: "July", 8: "August",
             9: "September", 10: "October", 11: "November", 12: "December"}

# Global Variable - date, month, year
dmy = [0, 0, 0]


@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "GET":
        return render_template("index.html")


@app.route("/calendar", methods=["GET", "POST"])
def calen():
    # List of Dates where 'events' are marked
    list_of_dates = []

    if request.method == "GET":
        # Get today's date
        date = datetime.today().strftime('%Y-%m-%d')
        # Split date into it's separate entities
        y, m, d = date.split('-')

        # Append 'dmy' list with today's date
        dmy[0] = int(d)
        dmy[1] = int(m)
        dmy[2] = int(y)

        # Establishing Connection
        con = sqlite3.connect('reminder.db')
        con.row_factory = sqlite3.Row
        cur = con.cursor()

        # Query into 'events' Table
        query = cur.execute("SELECT Date FROM events WHERE Month = ? AND Year = ?;", (m, y))

        # Fetch every database entry that matches the query
        all_dates = query.fetchall()

        for each_Date in all_dates:
            list_of_dates.append(each_Date['Date'])

        js_dates = json.dumps(list_of_dates)  # Passing to templates rendering

        # Get the Calendar as a HTML tag
        htmlc = calendar.HTMLCalendar(calendar.SUNDAY)
        this_month = htmlc.formatmonth(int(y), int(m))
        return render_template("calendar.html", this_month=this_month, js_dates=js_dates)

    elif request.method == "POST":

        # Retrieve values from Form via AJAX
        month = request.form.get("month")
        year = request.form.get("year")

        # Append 'dmy' list with month and year values
        dmy[1] = month  # First index of 'dmy' -> month
        dmy[2] = int(year)  # Second index of 'dmy' -> year

        # Get corresponding key from 'dict' based on value received
        for num, name in monthlist.items():
            if name == month:
                mth = num

        # Establishing Connection
        con = sqlite3.connect('reminder.db')
        con.row_factory = sqlite3.Row
        cur = con.cursor()

        # Query 'events' table
        query = cur.execute("SELECT Date FROM events WHERE Month = ? AND Year = ?;", (mth, year))

        # Fetch every date value from Table
        datelist = query.fetchall()

        everydate = []

        for each in datelist:
            everydate.append(each['Date'])

        # Get the calendar as HTML tag
        htmlc = calendar.HTMLCalendar(calendar.SUNDAY)
        now_month = htmlc.formatmonth(int(year), int(mth))

        # Return back to AJAX so 'calendar' is displayed without page reloading
        return jsonify({"pres_month": now_month, "everydate": everydate})


@app.route("/events", methods=["POST"])
def events():

    # Retrieve values from 'Form'
    event = request.form.get("whichEvent")
    comment = request.form.get("whatComment")

    try:
        with sqlite3.connect("reminder.db") as con:
            # Establishing connection
            cur = con.cursor()

            # Insert into datebase table
            cur.execute("INSERT INTO events (Eventtype, Comment, Date, Month, Year) VALUES (?, ?, ?, ?, ?)",
                        (event, comment, dmy[0], dmy[1], dmy[2]))

            # Commit to Database
            con.commit()
            msg = "Your reminder added to the Date."
    except:
        con.rollback()
        msg = "Your reminder was not added to the Date."
    finally:
        con.close()
        return jsonify({"msg": msg})


@app.route("/date_val", methods=["POST"])
def date_val():
    date = request.form.get("date")

    # Insert 'date' value into 'list dmy'
    dmy[0] = int(date)

    for k, v in monthlist.items():
        if dmy[1] == v:
            dmy[1] = k

    return "1"


@app.route("/event_details", methods=["GET", "POST"])
def event_details():
    if request.method == "GET":
        return render_template("details.html")
    elif request.method == "POST":
        mth = request.form.get("month")
        yr = request.form.get("year")

        # Create a list of dict
        dbentry = []

        # List of dates in 'chronological' order
        dlist = []

        # Mapping month name with month number
        for k, v in monthlist.items():
            if mth == v:
                mth = k

        # Establishing Connection
        con = sqlite3.connect('reminder.db')
        con.row_factory = sqlite3.Row
        cur = con.cursor()

        # Select events from Database based on the 'form' values
        query = cur.execute("SELECT * FROM events WHERE Month = ? AND Year = ?;", (mth, yr))

        # Fetch every database entry that matches the query
        all_events = query.fetchall()

        if len(all_events) == 0:
            dbentry.append({'date': 0})  # When database has no entries for a time period

        for i in range(len(all_events)):
            dlist.append(all_events[i]['Date'])

        dlist.sort()

        # For every element in the list of Database results
        for i in range(len(all_events)):
            for j in range(len(all_events)):
                if dlist[i] == all_events[j]['Date']:
                    # A new dictionary
                    new_dict = {}
                    new_dict['type'] = all_events[j]['Eventtype']
                    new_dict['date'] = all_events[j]['Date']
                    new_dict['month'] = all_events[j]['Month']
                    new_dict['year'] = all_events[j]['Year']
                    new_dict['desc'] = all_events[j]['Comment']
                    dbentry.append(new_dict)

        return jsonify({"dbentry": dbentry})


@app.route("/delete", methods=["POST"])
def delete():

    # Receiving values from AJAX call
    returned = request.get_json()

    # Total Elements
    total = returned['total_rows']

    # Number of elements returned for 'deletion'
    checked = len(returned['checked_rows'])

    # Element Id
    checked_elems = returned['checked_rows']

    # Data's of the elements
    all_datas = returned['all_datas']

    msg = "error or right"

    with sqlite3.connect('reminder.db') as con:
        try:
            cur = con.cursor()

            for i in range(checked):
                _date, _month, _year = all_datas[i][0].strip().split('-')
                _type = all_datas[i][1]
                _desc = all_datas[i][2]
                cur.execute("DELETE FROM events WHERE Eventtype = ? AND Comment = ? AND Date = ? AND Month = ? AND Year = ?;",
                            (_type, _desc, _date, _month, _year))
                if total == checked:
                    msg = "All events deleted successfully! No more events in this time period."
                else:
                    msg = "Deleted Successfully!"
        except:
            msg = "Deletion Unsuccessful!"
        finally:
            return jsonify({"msg": msg})


@app.route("/update", methods=["POST"])
def update():
    return render_template("details.html")


@app.route("/movedate", methods=["POST"])
def movedate():
    return render_template("details.html")



if __name__ == "__main__":
    app.run(debug=True)
