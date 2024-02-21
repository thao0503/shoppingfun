module.exports = (query) => {
    let objectSearch = {
        keyword: "",
    };
        if(query.keyword){
            objectSearch.keyword = query.keyword;
            const keywordRegex = new RegExp(objectSearch.keyword,"i");
            objectSearch.keywordRegex = keywordRegex;
        }
    return objectSearch;
}

