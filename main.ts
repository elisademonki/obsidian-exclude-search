import { Plugin, TFile, SearchResult } from 'obsidian';

export default class ExcludeSearchPlugin extends Plugin {
  // Diese Methode wird aufgerufen, wenn das Plugin geladen wird.
  async onload() {
    console.log('ExcludeSearchPlugin geladen');

    // Registriere einen Event Listener, der auf die Suche reagiert.
    this.registerEvent(
      this.app.workspace.on('search:results', (results) => {
        this.excludeExtensions(results);
      })
    );
  }

  // Diese Methode wird aufgerufen, wenn das Plugin entladen wird.
  onunload() {
    console.log('ExcludeSearchPlugin entladen');
  }

  // Funktion, um die Ergebnisse zu filtern
  excludeExtensions(results: any) {
    const excludedExtensions = ['txt', 'jpg', 'png'];

    // Durchlaufe die Suchergebnisse und filtere unerwünschte Dateitypen aus
    results.dom.resultDoms = results.dom.resultDoms.filter((result: any) => {
      const file = result.file as TFile;
      const extension = file.extension;

      // Wenn die Dateiendung in der Liste der zu exkludierenden Endungen ist, wird sie nicht in die Ergebnisse aufgenommen.
      return !excludedExtensions.includes(extension);
    });
  }
}
