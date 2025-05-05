use typing_engine::parse_vocabulary_entry;

fn parse_dictionary_body(filename: &str, body: &str) {
    for (i, line) in body.lines().enumerate() {
        let line_number = i + 1;

        assert!(
            !line.trim().is_empty(),
            "File: {}. Line {} is empty",
            filename,
            line_number
        );

        match parse_vocabulary_entry(line) {
            Ok(_) => {}
            Err(err) => {
                panic!(
                    "File: {}. Line {}. about: {}, detail: {}",
                    filename,
                    line_number,
                    err,
                    err.to_string()
                );
            }
        }
    }
}

fn parse_dictionary_file(filename: &str) {
    let file_content = std::fs::read_to_string(filename).expect("Unable to read file");
    let body = file_content.trim();

    assert!(!body.is_empty(), "File: {} is empty", filename);

    parse_dictionary_body(filename, body);
}

#[test]
fn test_dictionary_validity() {
    let dictionary_files =
        std::fs::read_dir("public/dictionary").expect("Unable to read directory");

    dictionary_files.for_each(|entry| {
        let entry = entry.expect("Unable to read entry");
        let filename = entry.path().to_str().expect("Invalid filename").to_string();

        parse_dictionary_file(&filename);
    });
}
