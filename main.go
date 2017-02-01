package devfest_website

import (
	"net/http"
)

func init() {
	http.HandleFunc("/", Redirect)
}

func Redirect(w http.ResponseWriter, r *http.Request) {
	http.Redirect(w, r, "https://2017.devfest.cz", http.StatusMovedPermanently)
}