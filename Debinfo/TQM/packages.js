
if (typeof document.onselectstart != "undefined") {
    document.onselectstart = new Function("return false");
} else {
    document.onmousedown = new Function("return false");
    document.onmouseup = new Function("return true");
}

$(document).ready(function () {
    function iOSVersion() {
        if (/iP(hone|od|ad)/.test(navigator.platform)) {
            // supports iOS 2.0 and later: <http://bit.ly/TJjs1V>
            var v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
            var version = [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3] || 0, 10)];
            return version.join('.');
        }
    }

    // return int
    // -2 : error
    // -1 : ascending (version1 < version2)
    // 0 : equal (version1 = version 2)
    // 1 : descending (version1 > version2)
    function compareVersions(version1, version2) {
        if (typeof version1 === 'undefined' || typeof version2 === 'undefined') {
            return -2;
        }

        var version1Array = version1.split('.');
        var version2Array = version2.split('.');
        var compareCount = version1Array.length < version2Array.length ? version1Array.length : version2Array.length;
        var i;
        for (i = 0; i < compareCount; i++) {
            var fragVer1 = parseFloat(version1Array[i]);
            var fragVer2 = parseFloat(version2Array[i]);
            if (fragVer1 > fragVer2) {
                return 1;
            } else if (fragVer1 < fragVer2) {
                return -1;
            }
        }

        if (version1Array.length > compareCount && version1Array[i + 1] !== '0') {
            return 1;
        } else if (version2Array.length > compareCount && version2Array[i + 1] !== '0') {
            return -1;
        }

        return 0;
    }

    function isCurrentVersionSupported(currentVersion, minVersion, maxVersion) {
        if (typeof minVersion === 'undefined' && typeof maxVersion === 'undefined') {
            return false;
        }

        var minVersionComparison = (compareVersions(minVersion, currentVersion) === -1 || compareVersions(minVersion, currentVersion) === 0);
        var maxVersionComparison = (compareVersions(currentVersion, maxVersion) === -1 || compareVersions(currentVersion, maxVersion) === 0);

        if (typeof minVersion !== 'undefined' && typeof maxVersion === 'undefined' && minVersionComparison) {
            return true;
        } else if (typeof minVersion === 'undefined' && typeof maxVersion !== 'undefined' && maxVersionComparison) {
            return true;
        }

        return minVersionComparison && maxVersionComparison;
    }

    var dPackage = getParameterByName("p");
    if (!dPackage) {
        $(".package-error").text("Dữ liệu code text by Long Mến !").css("display", "block");
        $(".package-info").css("display", "none");
        $(".package-name").text("Not Found");
        return;
    }

    $.getJSON(dPackage + ".json", function (data) {
        document.title = data.name + " by " + data.author;

        // iOS version check
        var currentVersion = iOSVersion();
        if (typeof currentVersion === 'undefined' &&
            (typeof data.minOSVersion !== 'undefined' || typeof(data.maxOSVersion) !== 'undefined')) {
            var result = "<strong>Hỗ trợ phiên bản ";

            if (typeof data.minOSVersion != 'undefined') {
                result += data.minOSVersion;
                result += (typeof data.maxOSVersion != 'undefined') ? " to " + data.maxOSVersion : "";
            } else if (typeof data.maxOSVersion != 'undefined') {
                result += data.maxOSVersion;
            }

            result += ".</strong>";
            $(".version-check").html(result);
            $(".version-check").css("color", "#333");
        } else {
            // Compare versions
            var result = "";
            var supported = isCurrentVersionSupported(currentVersion, data.minOSVersion, data.maxOSVersion);
            if (supported) {
                result += "Phiên bản hiện tại (" + currentVersion + ") đã tương thích</strong> &#x1F60D;";
                // $(".version-check").css("color", "green");
                $(".panel-body.version-check").css("background-color", "#4DE447");
            } else{
                result += "Phiên bản hiện tại <strong>không hỗ trợ</strong>&#x2620;";
                result += (typeof currentVersion != 'undefined') ? " (" + currentVersion + ")" : "";
                result += " &#x1F914;";
                $(".panel-body.version-check").css("background-color", "#ffcc00");
            }
            $(".version-check").html(result);
        }

           })

    .fail(function () {
        $(".package-error").text("Đã xảy ra lỗi khi truy xuất thông tin gói!").css("display", "block");
        $(".package-info").css("display", "none");
        $(".package-name").text("Lỗi kho lưu trữ");
        return;
    });

    function getParameterByName(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, " "));
    }
});