$(document).ready(function() {
  var articleScrape = $(".article-container");
  $(document).on("click", ".btn.delete", handleArticleDelete);
  $(document).on("click", ".btn.notes", handleArticleNotes);
  $(document).on("click", ".btn.save", handleNoteSave);
  $(document).on("click", ".btn.note-delete", handleNoteDelete);
  $(".clear").on("click", handleArticleClear);

  function initPage() {
    $.get("/api/headlines?saved=true").then(function(data) {
      articleScrape.empty();
      if (data && data.length) {
        makeArticles(data);
      } else {
        emptyAll();
      }
    });
  }

  function makeArticles(articles) {
    var articleCards = [];
    for (var i = 0; i < articles.length; i++) {
      articleCards.push(addCard(articles[i]));
    }
    articleScrape.append(articleCards);
  }

  function addCard(article) {
    var card = $("<div class='card'>");
    var cardHeader = $("<div class='card-header'>").append(
      $("<h3>").append(
        $("<a class='article-link' target='_blank' rel='noopener noreferrer'>")
          .attr("href", article.url)
          .text(article.headline),
        $("<a class='btn btn-danger delete'>Delete From Saved</a>"),
        $("<a class='btn btn-info notes'>Article Notes</a>")
      )
    );

    var cardBody = $("<div class='card-body'>").text(article.summary);

    card.append(cardHeader, cardBody);

    card.data("_id", article._id);
    return card;
  }

  function emptyAll() {
    var emptyAlert = $(
      [
        "<div class='alert alert-warning text-center'>",
        "<h4>Uh Oh. Looks like we don't have any saved articles.</h4>",
        "</div>",
        "<div class='card'>",
        "<div class='card-header text-center'>",
        "<h3>Would You Like to Browse Available Articles?</h3>",
        "</div>",
        "<div class='card-body text-center'>",
        "<h4><a href='/'>Browse Articles</a></h4>",
        "</div>",
        "</div>"
      ].join("")
    );
    articleScrape.append(emptyAlert);
  }

  function changeList(data) {
    var notesToRender = [];
    var currentNote;
    if (!data.notes.length) {
      currentNote = $("<li class='list-group-item'>No notes for this article yet.</li>");
      notesToRender.push(currentNote);
    } else {
      for (var i = 0; i < data.notes.length; i++) {
        currentNote = $("<li class='list-group-item note'>")
          .text(data.notes[i].noteText)
          .append($("<button class='btn btn-danger note-delete'>x</button>"));
        currentNote.children("button").data("_id", data.notes[i]._id);
        notesToRender.push(currentNote);
      }
    }
    $(".note-container").append(notesToRender);
  }

  function handleArticleDelete() {
    var articleToDelete = $(this)
      .parents(".card")
      .data();

    $(this)
      .parents(".card")
      .remove();
    console.log(articleToDelete._id)
    $.ajax({
      method: "DELETE",
      url: "/api/headlines/" + articleToDelete._id
    }).then(function(data) {
      if (data) {
        window.load = "/saved"
      }
    });
  }
  function handleArticleNotes(event) {
    var thisArticle = $(this)
      .parents(".card")
      .data();
    console.log(thisArticle)
    $.get("/api/notes/" + thisArticle._id).then(function(data) {
      console.log(data)
      var modalText = $("<div class='container-fluid text-center'>").append(
        $("<h4>").text("Notes For Article: " + thisArticle._id),
        $("<hr>"),
        $("<ul class='list-group note-container'>"),
        $("<textarea placeholder='New Note' rows='4' cols='60'>"),
        $("<button class='btn btn-success save'>Save Note</button>")
      );
      console.log(modalText)
      bootbox.dialog({
        message: modalText,
        closeButton: true
      });
      var noteData = {
        _id: thisArticle._id,
        notes: data || []
      };
      console.log('noteData:' + JSON.stringify(noteData))
      $(".btn.save").data("article", noteData);
      changeList(noteData);
    });
  }

  function handleNoteSave() {
    var noteData;
    var newNote = $(".bootbox-body textarea")
      .val()
      .trim();
    if (newNote) {
      noteData = { _headlineId: $(this).data("article")._id, noteText: newNote };
      $.post("/api/notes", noteData).then(function() {
        bootbox.hideAll();
      });
    }
  }

  function handleNoteDelete() {
    var noteToDelete = $(this).data("_id");
    $.ajax({
      url: "/api/notes/" + noteToDelete,
      method: "DELETE"
    }).then(function() {
      bootbox.hideAll();
    });
  }

  function handleArticleClear() {
    $.get("api/clear")
      .then(function(data) {
        articleScrape.empty();
        location.reload();
      });
  }
});