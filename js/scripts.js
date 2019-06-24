$(document).ready(function(){
    resetForm();
    listReadings();
});

function listReadings(){
    showToast("warning", "Loading data...");

    glicomoni_db.collection("readings").orderBy("date", "desc").limit(20).get().then((query_snapshot) => {
        let result = "";
        let current_date = "";
        let current_row = 0;

        query_snapshot.forEach((doc) => {
            let readable_date = parseFirebaseDate(doc.data().date);
            let zebra_class = current_row % 2 !== 0 ? "bg-light" : "bg-white";

            if(readable_date.date !== current_date){
                current_date = readable_date.date;

                result += `<div class="results_contents row justify-content-center px-4" data-id="${doc.id}"><div class="col ${zebra_class}">${current_date}</div><div class="col ${zebra_class} text-center">${readable_date.time}</div><div class="col ${zebra_class} text-right">${doc.data().value}</div></div>`;
            }else{
                result += `<div class="results_contents row justify-content-center px-4" data-id="${doc.id}"><div class="col ${zebra_class}"></div><div class="col ${zebra_class} text-center">${readable_date.time}</div><div class="col ${zebra_class} text-right">${doc.data().value}</div></div>`;
            }

            current_row++;
        });

        $("#result").html(result);
    });

    getAverages();

    showToast("success", "Data loaded!");
}

function getAverages(){
    let date_today = new Date();
    let date_one_month_ago = new Date(new Date().setMonth(date_today.getMonth() - 1));
    let date_one_week_ago = new Date(new Date().setDate(date_today.getDate() - 7));
    let date_one_day_ago = new Date(new Date().setDate(date_today.getDate() - 1));

    glicomoni_db.collection("readings").orderBy("date", "desc").where("date", ">=", createFirebaseDate(date_one_month_ago.getTime())).get().then((query_snapshot) => {
        let total_day = 0;
        let quantity_day = 0;
        let average_day = 0;
        let total_week = 0;
        let quantity_week = 0;
        let average_week = 0;
        let total_month = 0;
        let quantity_month = 0;
        let average_month = 0;

        query_snapshot.forEach((doc) => {
            let readable_date = parseFirebaseDate(doc.data().date);

            if(readable_date.milliseconds > date_one_day_ago.getTime()){
                total_day++;
                quantity_day += doc.data().value;
            }

            if(readable_date.milliseconds > date_one_week_ago.getTime()){
                total_week++;
                quantity_week += doc.data().value;
            }

            if(readable_date.milliseconds > date_one_month_ago.getTime()){
                total_month++;
                quantity_month += doc.data().value;
            }
        });

        average_day = (quantity_day / total_day).toFixed(2).replace(".", ",");
        average_week = (quantity_week / total_week).toFixed(2).replace(".", ",");
        average_month = (quantity_month / total_month).toFixed(2).replace(".", ",");

        $("#average-day").text(average_day);
        $("#average-week").text(average_week);
        $("#average-month").text(average_month);
    });
}

function parseFirebaseDate(firebase_date){
    let original_date = new Date(firebase_date.toDate());
    let parsed_date = {
        "date": `${padNumber(original_date.getDate(), 2, "0")}/${padNumber(original_date.getMonth() + 1, 2, "0")}/${original_date.getFullYear().toString().substr(-2)}`,
        "time": `${padNumber(original_date.getHours(), 2, "0")}:${padNumber(original_date.getMinutes(), 2, "0")}`,
        "day": original_date.getDate(),
        "month": (original_date.getMonth() + 1),
        "year": original_date.getFullYear(),
        "milliseconds": original_date.getTime(),
    };

    return parsed_date;
}

function createFirebaseDate(javascript_milliseconds){
    return firebase.firestore.Timestamp.fromMillis(javascript_milliseconds);
}

function padNumber(number, length, pad_string){
    return number.toString().padStart(length, pad_string);
}

function prepareReadingObject(){
    let year = parseInt("20" + $("#date_year").val());
    let month = parseInt($("#date_month").val()) - 1;
    let day = parseInt($("#date_day").val());
    let hours = parseInt($("#time_hours").val());
    let minutes = parseInt($("#time_minutes").val());

    let final_date = new Date(year, month, day, hours, minutes);

    let timestamp = createFirebaseDate(final_date.getTime());
    let value = parseInt($("#test_result").val());

    return {timestamp: timestamp, value: value};
}

function saveReading(timestamp, value){
    if(!validateForm()){
        return;
    }

    showToast("warning", "Saving data...");

    let reading_object =  prepareReadingObject();

    glicomoni_db.collection("readings").add({
        date: reading_object.timestamp,
        value: reading_object.value,
    })
    .then((doc) => {
        showToast("success", "Saved successfully!");

        listReadings();
    })
    .catch((error) => {
        showToast("error", `Error saving: ${error}`);
    });
}

function validateForm(){
    let invalid_fields = [];

    $("input[type=number]").removeClass("border-danger");

    $("input[type=number]").each(function(){
        if($(this).val() === ""){
            invalid_fields.push($(this));
        }
    });

    if(invalid_fields.length > 0){
        $(invalid_fields).each(function(){
            $(this).addClass("border-danger");
        });

        showToast("error", "One or more fields are empty.");

        return false;
    }else{
        return true;
    }
}

function resetForm(){
    let current_date = new Date();

    $("#date_day").val(padNumber(current_date.getDate(), 2, "0"));
    $("#date_month").val(padNumber((current_date.getMonth() + 1), 2, "0"));
    $("#date_year").val(current_date.getFullYear().toString().substr(-2));
    $("#time_hours").val(padNumber(current_date.getHours(), 2, "0"));
    $("#time_minutes").val(padNumber(current_date.getMinutes(), 2, "0"));
    $("#test_result").val("");
}

function showToast(type, message){
    let type_toast = {
        "success": {icon: "&check;", classes: "col-auto rounded-pill py-1 shadow-sm bg-success"},
        "error": {icon: "&times;", classes: "col-auto rounded-pill py-1 shadow-sm bg-danger"},
        "warning": {icon: "!", classes: "col-auto rounded-pill py-1 shadow-sm bg-warning"},
    };

    $("#toast-message").attr("class", type_toast[type]["classes"]);
    $("#toast-icon").html(type_toast[type]["icon"]);
    $("#toast-text").text(message);
    $("#toast-container").finish().fadeIn(300).delay(1200).fadeOut(200);
}