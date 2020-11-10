package com.example.weforvegan;

public class SNSRecipe {
    int snsIdx;
    String snsUrl;
    String snsImgUrl;
    String snsTitle;
    String source;

    public SNSRecipe(int snsIdx, String snsTitle, String snsUrl, String snsImgUrl, String source){
        this.snsIdx = snsIdx;
        this.snsTitle = snsTitle;
        this.snsImgUrl = snsImgUrl;
        this.snsUrl = snsUrl;
        this.source = source;
    }

    public int getSnsIdx() {
        return snsIdx;
    }

    public void setSnsIdx(int snsIdx) {
        this.snsIdx = snsIdx;
    }

    public String getSnsTitle() {
        return snsTitle;
    }

    public void setSnsTitle(String snsTitle) {
        this.snsTitle = snsTitle;
    }

    public String getSnsUrl() {
        return snsUrl;
    }

    public void setSnsUrl(String snsUrl) {
        this.snsUrl = snsUrl;
    }

    public String getSnsImgUrl() {
        return snsImgUrl;
    }

    public void setSnsImgUrl(String snsImgUrl) {
        this.snsImgUrl = snsImgUrl;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }
}