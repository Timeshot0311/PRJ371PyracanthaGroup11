package com.vusieam.invascan.domain

class Versioning (private var major: String, private var minor: String, private var build: String) {

    override fun toString(): String {
        return "v${major}.${minor} build(${build})"
    }
}