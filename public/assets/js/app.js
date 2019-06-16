$(document).ready(function () {
    /////////HOME/////////
    // 1.scrape button on click
    $(document).off("click", "#scrape").on("click", "#scrape", function () {
        console.log("scrape button is clicked")
        // // disable scrape button
        // $("#scrape").attr("disabled", true)

        $.get("/scrape", function (data) {
            console.log("scrape is complete")
            location.reload("/")
        });
    });

    // 2.see favorites button on click
    $(document).off("click", "#favorite").on("click", "#favorite", function () {
        console.log("See All the favorites")

        $.ajax({
            url: "favorite",
            type: "GET",
        }).then((data) => {
            console.log(data)
            console.log("End Ajax")
            window.location.href = "/favorite"
        });
    });

    // 3.clear All button on click
    $(document).off("click", "#clearAll").on("click", "#clearAll", function () {
        console.log("Clear All Articles")

        $.ajax({
            url: "article",
            type: "DELETE",
        }).then(() => {
            console.log("End Ajax")
            window.location.href = "/"
        });
    });

    // 4.add to favorite button on click
    $(document).off("click", ".addFavorite").on("click", ".addFavorite", function () {
        let id = $(this).data("id")
        console.log("add Favorite button is clicked. Id is " + id)

        let favorite = $(this).attr("favorite")
        let updatedFavorite;

        if (favorite === "true") {
            console.log("if block")
            updatedFavorite = false
            $(this).text("Add to Favorite")
        } else {
            console.log("else block")
            updatedFavorite = true
            $(this).text("Undo Favorite")

        }

        $(this).attr("favorite", updatedFavorite)

        $.ajax({
            url: "favorite/" + id,
            type: "PUT",
            data: { favorite: updatedFavorite }
        }).then(() => {
            console.log("End Ajax")
            // window.location.href = "/"
        });
    });

    /////////FAVORITE PAGE/////////
    //0. go back button on click
    $(document).off("click", "#goBack").on("click", "#goBack", function () {
        window.location.href = "/"
    });

    //1. clear all the favorite button on click 
    $(document).off("click", "#clearFavorite").on("click", "#clearFavorite", function () {
        $.ajax({
            url: "favorite",
            type: "PUT",
        }).then(() => {
            console.log("End Ajax(Delete All Favorites)")
            window.location.href = "/favorite"
        });
    });

    //2. delete each favorite button on click
    $(document).off("click", ".deleteFavorite").on("click", ".deleteFavorite", function () {
        let id = $(this).data("id")
        console.log("add Favorite button is clicked. Id is " + id)

        let favorite = $(this).attr("favorite")
        let updatedFavorite;

        if (favorite === "true") {
            console.log("if block")
            updatedFavorite = false
        } else {
            console.log("else block")
            updatedFavorite = true
        }

        $(this).attr("favorite", updatedFavorite)

        $.ajax({
            url: "favorite/" + id,
            type: "PUT",
            data: { favorite: updatedFavorite }
        }).then(() => {
            console.log("End Ajax")
            window.location.href = "/favorite"
        });
    });

    /////////NOTE PAGE/////////
    $(document).off("click", ".noteButton").on("click", ".noteButton", function () {
        let id = $(this).data("id")
        let myWindow = window.open("/note/" + id, 'popUpWindow', 'height=300,width=700,left=50,top=50,resizable=yes,scrollbars=yes,toolbar=yes,menubar=no,location=no,directories=no, status=yes')
    })

    $(document).off("click", ".saveNote").on("click", ".saveNote", function () {
        let id = $(this).data("id")
        console.log($("#noteContent").val())
        $.ajax({
            method: "POST",
            url: "/note/" + id,
            data: {
              body: $("#noteContent").val()
            }
          })
            // With that done
            .then(function(data) {
              // Log the response
              console.log(data);
              // Empty the notes section
              $("#noteContent").empty();
              opener.location.reload()
              window.close()
            });        
    })

    $(document).off("click", "#deleteNote").on("click", "#deleteNote", function () {
        console.log("delete note")
        let id = $(this).data("id")
        $.ajax({
            url: "note/"+ id,
            type: "DELETE",
        }).then(() => {
            console.log("End Ajax")
            location.reload()
        });     
    })
})