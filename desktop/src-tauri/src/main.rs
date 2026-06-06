// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::api::process::Command;

fn main() {
    tauri::Builder::default()
        .setup(|_app| {
            // Spawn the Node.js daemon sidecar
            let (_rc, _child) = Command::new_sidecar("pars-daemon")
                .expect("Failed to create pars-daemon sidecar command")
                .args(["serve"]) // Launch the backend Express server
                .spawn()
                .expect("Failed to spawn pars-daemon sidecar");
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
