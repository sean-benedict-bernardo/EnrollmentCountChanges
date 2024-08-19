// ==UserScript==
// @name         Enrollment Count Changes
// @namespace    http://tampermonkey.net/
// @version      2024-08-17
// @description  try to take over the world!
// @author       Sean Benedict Bernardo
// @match        https://enroll.dlsu.edu.ph/dlsu/view_course_offerings
// @icon         https://www.google.com/s2/favicons?sz=64&domain=edu.ph
// @grant        none
// @run-at       context-menu
// ==/UserScript==

class UserSched {
    constructor() {
        this.course = "";
        this.last_update;
        this.classes = []
        this.scrapeSchedule()
    }

    scrapeSchedule() {
        let table_rows = document.querySelector("form[action=\"view_course_offerings\"]>table>tbody").querySelectorAll("tr:not(:first-child)");
        let subject_json = { meetings: [] };

        let tr_index = 0;

        try {
        while (tr_index < table_rows.length) {
            let course_details = table_rows[tr_index].children;

            // new subject line
            if (course_details[0].innerHTML != "\n&nbsp;&nbsp;" && course_details.length == 9) {
                this.classes.push(subject_json);

                subject_json = {
                    coursecode: course_details[1].innerText.trimEnd(),
                    section: course_details[2].innerText.trimEnd(),
                    professor: table_rows[tr_index + 1].children[0].innerText.trimEnd(),
                    enrl_cap: course_details[6].innerText.trimEnd(),
                    enrolled: course_details[7].innerText.trimEnd(),
                    remarks: course_details[8].innerText.trimEnd(),
                }
            }

            this.course = subject_json.coursecode;

            do {
                tr_index++;
            }
            while (tr_index < table_rows.length - 1 && table_rows[tr_index].children[0].innerText.trimEnd() == "");
        }

        } catch (err) {
            console.error(err)
        }

        this.classes.shift();

        this.classes.push(subject_json);
    }

    checkChanges() {
        let localObj;
        this.last_update = new Date().toLocaleString();

        try {
            localObj = JSON.parse(localStorage[this.course]);
        } catch (error) {

        }


        if (localObj == undefined || localObj == null) {
            localStorage[this.course] = JSON.stringify(this.classes);
            alert("Initial save");
        } else {
            let changes_str = "";

            localObj.forEach((course, i) => {
                if (this.classes[i].enrolled != course.enrolled)
                    changes_str += `${course.section} : ${course.enrolled} -> ${this.classes[i].enrolled}\n`;
            });

            // write time to localstorage
            localStorage[this.course] = JSON.stringify(this.classes);

            alert((changes_str != "") ? changes_str : "No changes");
        }

    }
}

(function () {
    let sched_obj = new UserSched();
    sched_obj.checkChanges();
})();