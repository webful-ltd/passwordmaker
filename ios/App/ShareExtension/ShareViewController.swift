import UIKit
import Social

class ShareViewController: SLComposeServiceViewController {
    // MUST match the appGroupId in capacitor.config.ts
    let APP_GROUP_ID = "group.urlshare.uk.webful.passwordmaker"
    // Custom URL scheme - registered in main app's Info.plist
    let APP_URL_SCHEME = "passwordmaker"

    override func isContentValid() -> Bool {
        // Validate that we have some content
        return true
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        navigationController?.navigationBar.topItem?.title = "PasswordMaker"
        textView.text = "'Post' passes the URL to PasswordMaker"
        textView.isEditable = false
    }

    override func didSelectPost() {
        // Called when the user taps Post
        guard let item = extensionContext?.inputItems.first as? NSExtensionItem else {
            self.extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
            return
        }
        
        Task {
            var urlToShare: String? = nil
            
            // Process attachments - prioritize URL type
            if let attachments = item.attachments {
                for provider in attachments {
                    // Handle URLs (most common from Safari)
                    if provider.hasItemConformingToTypeIdentifier("public.url") {
                        if let url = try? await provider.loadItem(forTypeIdentifier: "public.url", options: nil) as? URL {
                            urlToShare = url.absoluteString
                            break  // Got a URL, that's what we want
                        }
                    }
                }
                
                // Fallback to plain text if no URL found
                if urlToShare == nil {
                    for provider in attachments {
                        if provider.hasItemConformingToTypeIdentifier("public.plain-text") {
                            if let text = try? await provider.loadItem(forTypeIdentifier: "public.plain-text", options: nil) as? String {
                                urlToShare = text
                                break
                            }
                        }
                    }
                }
            }
            
            guard let textToShare = urlToShare else {
                NSLog("ShareExtension: No URL or text found")
                self.extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
                return
            }
            
            NSLog("ShareExtension: text to share: \(textToShare)")
            
            // Save to shared UserDefaults
            if let userDefaults = UserDefaults(suiteName: APP_GROUP_ID) {
                let shareData: [String: Any] = [
                    "title": item.attributedTitle?.string ?? "",
                    "texts": [textToShare],
                    "files": []
                ]
                userDefaults.set(shareData, forKey: "share-target-data")
                userDefaults.synchronize()
                NSLog("ShareExtension: Saved to UserDefaults")
            } else {
                NSLog("ShareExtension: Failed to get UserDefaults!")
            }
            
            // Open the main app via URL scheme
            if let url = URL(string: "\(APP_URL_SCHEME)://share") {
                await self.openURL(url)
            }
            
            self.extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
        }
    }

    override func configurationItems() -> [Any]! {
        // Return any configuration items for the share sheet (optional)
        return []
    }
    
    @MainActor
    private func openURL(_ url: URL) async {
        var responder: UIResponder? = self as UIResponder
        while responder != nil {
            if let application = responder as? UIApplication {
                await application.open(url)
                return
            }
            responder = responder?.next
        }
    }
}
